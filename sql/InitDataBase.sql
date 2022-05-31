CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

create domain algorithmname varchar check (VALUE IN ('ItemKNN', 'Popularity', 'Recency'));

CREATE EXTENSION if not exists citext;
CREATE DOMAIN email AS citext
    CHECK ( value ~
            '^[a-zA-Z0-9.!#$%&''*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$' );
CREATE DOMAIN nat_int bigint check ( value >= 0 );


CREATE TABLE IF NOT EXISTS "datascientist"
(
    "username"       varchar PRIMARY KEY,
    datascientist_id bigserial unique not null,

    "first_name"     varchar       NOT NULL,
    "last_name"      varchar       NOT NULL,

    "created_on"     timestamp     NOT NULL default now(),
    "birthdate"      date          NOT NULL,
    "password"       varchar       NOT NULL,
    "email_address"  email UNIQUE  NOT NULL
);

CREATE TABLE IF NOT EXISTS "admin"
(
    "username" varchar primary key references "datascientist" (username) on update cascade on delete cascade
);

CREATE TABLE IF NOT EXISTS "dataset"
(
    "name"        varchar primary key,
    "uploaded_by" varchar NOT NULL references admin (username) on update cascade on delete cascade
);


CREATE TABLE IF NOT EXISTS "customer"
(
    "unique_customer_id" bigserial,
    "customer_id"        nat_int not null,
    "dataset_name"       varchar NOT NULL references dataset (name) on update cascade on delete cascade,
    unique (customer_id, dataset_name),
    primary key (unique_customer_id)

);

CREATE TABLE IF NOT EXISTS "ab_test"
(
    "abtest_id"    bigserial primary key,
    "top_k"        nat_int NOT NULL,
    "stepsize"     nat_int NOT NULL,
    "start_date"   date    NOT NULL,
    "end_date"     date    NOT NULL check (start_date < "end_date"),
    "dataset_name" varchar NOT NULL references dataset (name) on update cascade on delete cascade,
    "created_on"   date    NOT NULL default now(),
    "created_by"   varchar NOT NULL references "datascientist" (username) on update cascade on delete cascade
);



CREATE TABLE IF NOT EXISTS "article"
(

    "article_id"        nat_int not null,
    "dataset_name"      varchar NOT NULL references dataset (name) on update cascade on delete cascade,
    "unique_article_id" bigserial,
    unique (article_id, dataset_name),
    primary key (unique_article_id)

);



CREATE TABLE IF NOT EXISTS "article_attribute"
(
    "attribute_name"  varchar not null,
    "attribute_value" varchar not null,
    "type"            varchar not null,

    "article_id"      nat_int not null,
    "dataset_name"    varchar not null,
    foreign key (article_id, dataset_name) references article (article_id, dataset_name) on update cascade on delete cascade,
    primary key ("attribute_name", "article_id", dataset_name)
);



CREATE TABLE IF NOT EXISTS "customer_attribute"
(
    "type"            varchar not null,

    "attribute_name"  varchar not null,
    "attribute_value" varchar not null,
    "customer_id"     nat_int not null,
    "dataset_name"    varchar not null,
    foreign key (customer_id, dataset_name) references customer (customer_id, dataset_name) on update cascade on delete cascade,

    primary key ("attribute_name", "customer_id", dataset_name)
);
CREATE TABLE IF NOT EXISTS "purchase"
(
    "dataset_name" varchar          not null,
    "customer_id"  nat_int          NOT NULL,
    article_id     nat_int          NOT NULL,
    "bought_on"    date             not null,
    "price"        double precision NOT NULL,
    foreign key (article_id, dataset_name) references article (article_id, dataset_name) on update cascade on delete cascade,
    foreign key (customer_id, dataset_name) references customer (customer_id, dataset_name) on update cascade on delete cascade,
    PRIMARY KEY ("dataset_name", "customer_id", "article_id", "bought_on")
);



CREATE TABLE IF NOT EXISTS "algorithm"
(
    "algorithm_id"   bigserial        not null,
    "abtest_id"      nat_int       not null,
    foreign key (abtest_id) references ab_test (abtest_id) on update cascade on delete cascade,
    "algorithm_type" algorithmname not null,
    PRIMARY KEY ("algorithm_id")
);


CREATE TABLE IF NOT EXISTS "parameter"
(
    "parameter_name" varchar not null,
    "algorithm_id"   nat_int not null,
    "type"           varchar not null,

    foreign key (algorithm_id) references algorithm (algorithm_id) on update cascade on delete cascade,
    "value"          varchar not null,
    PRIMARY KEY ("parameter_name", "algorithm_id")
);


CREATE TABLE IF NOT EXISTS "statistics"
(
    "statistics_id" bigserial PRIMARY KEY,
    "date_of"       date    not null,
    "algorithm_id"  nat_int not null,

    unique (algorithm_id, date_of),

    foreign key (algorithm_id) references algorithm (algorithm_id) on update cascade on delete cascade
);


CREATE TABLE IF NOT EXISTS "customer_specific_statistics"
(
    "unique_customer_id" nat_int NOT NULL,
    "clicked_through" bool NOT NULL default false,

    "statistics_id"      nat_int NOT NULL,
    foreign key (statistics_id) references statistics (statistics_id) on update cascade on delete cascade,
    foreign key (unique_customer_id) references customer (unique_customer_id) on update cascade on delete cascade,
    PRIMARY KEY ("unique_customer_id", "statistics_id")
);

CREATE TABLE IF NOT EXISTS "recommendation"
(
    "recommendation_id"  nat_int not null,
    "unique_customer_id" nat_int not null,
    "statistics_id"      nat_int not null,
    "unique_article_id"  nat_int NOT NULL,

    foreign key (unique_article_id) references article (unique_article_id) on update cascade on delete cascade,
    foreign key (unique_customer_id, statistics_id) references customer_specific_statistics (unique_customer_id, statistics_id) on update cascade on delete cascade,
    PRIMARY KEY ("recommendation_id", "unique_customer_id", "statistics_id")
);


CREATE TABLE IF NOT EXISTS "dynamic_stepsize_var"
(
    statistics_id   nat_int references statistics (statistics_id) on update cascade on delete cascade,
    parameter_name  varchar,
    parameter_value varchar,
    PRIMARY KEY (statistics_id, parameter_name)
);

create view named_algorithm(algorithm_id, abtest_id, algorithm_type, algorithm_name) as
SELECT algorithm.algorithm_id,
       algorithm.abtest_id,
       algorithm.algorithm_type,
       parameter.value AS algorithm_name
FROM parameter
         RIGHT JOIN algorithm ON parameter.algorithm_id::integer = algorithm.algorithm_id AND
                                 parameter.parameter_name::text = 'AlgorithmName'::text;