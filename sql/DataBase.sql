DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

create domain algorithmname varchar check (VALUE IN ('ItemKNN', 'Popularity', 'Recency'));

CREATE EXTENSION citext;
CREATE DOMAIN email AS citext
    CHECK ( value ~
            '^[a-zA-Z0-9.!#$%&''*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$' );
CREATE DOMAIN nat_int int check ( value >= 0 );

CREATE TABLE "datascientist"
(
    "username"       varchar PRIMARY KEY,
    datascientist_id serial unique not null,

    "first_name"     varchar       NOT NULL,
    "last_name"      varchar       NOT NULL,

    "created_on"     timestamp     NOT NULL default now(),
    "birthdate"      date          NOT NULL,
    "password"       varchar       NOT NULL,
    "email_address"  email UNIQUE  NOT NULL
);

CREATE TABLE "admin"
(
    "username" varchar primary key references "datascientist" (username) on update cascade on delete cascade
);

CREATE TABLE "dataset"
(
    "name"        varchar primary key,
    "uploaded_by" varchar NOT NULL references admin (username) on update cascade on delete cascade
);

CREATE TABLE "customer"
(
    "customer_id"  nat_int,
    "dataset_name" varchar NOT NULL references dataset (name) on update cascade on delete cascade,
    primary key (customer_id, dataset_name)

);

CREATE TABLE "ab_test"
(
    "abtest_id"    serial primary key,
    "top_k"        nat_int NOT NULL,
    "stepsize"     nat_int NOT NULL,
    "start_date"        date    NOT NULL,
    "end_date"          date    NOT NULL check (start_date < "end_date"),
    "dataset_name" varchar NOT NULL references dataset (name) on update cascade on delete cascade,
    "created_on"   date    NOT NULL default now(),
    "created_by"   varchar NOT NULL references "datascientist" (username) on update cascade on delete cascade
);



CREATE TABLE "article"
(
    "article_id"   nat_int,
    "dataset_name" varchar NOT NULL references dataset (name) on update cascade on delete cascade,
    primary key (article_id, dataset_name)

);

create table "article_attribute"
(
    "attribute_name"    varchar not null,
    "attribute_value"        varchar not null,
    "dataset_name" varchar not null,
    "type"         varchar not null,

    "article_id"   nat_int not null,
    foreign key (article_id, dataset_name) references article (article_id, dataset_name) on update cascade on delete cascade,
    primary key ("attribute_name", "article_id", dataset_name)
);



create table "customer_attribute"
(
    "dataset_name" varchar not null,
    "type"         varchar not null,

    "attribute_name"    varchar not null,
    "attribute_value"        varchar not null,
    "customer_id"  nat_int not null,
    foreign key (customer_id, dataset_name) references customer (customer_id, dataset_name) on update cascade on delete cascade,

    primary key ("attribute_name", "customer_id", dataset_name)
);
CREATE TABLE "purchase"
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

CREATE TABLE "algorithm"
(
    "algorithm_id"   serial        not null,
    "abtest_id"      nat_int       not null,
    foreign key (abtest_id ) references ab_test(abtest_id) on update cascade on delete cascade,

    "algorithm_name" algorithmname NOT NULL,
    PRIMARY KEY ("algorithm_id", "abtest_id")
);

CREATE TABLE "parameter"
(
    "parameter_name" varchar not null,
    "algorithm_id"  nat_int not null,
    "abtest_id"     nat_int not null,
    "type"          varchar not null,

    foreign key (algorithm_id, abtest_id) references algorithm (algorithm_id, abtest_id) on update cascade on delete cascade,
    "value"         varchar not null,
    PRIMARY KEY ("parameter_name", "algorithm_id", "abtest_id")
);
CREATE TABLE "statistics"
(
    "statistics_id" serial PRIMARY KEY,
    "date_of"      date    not null,
    "algorithm_id"  nat_int not null,
    "abtest_id"     int     not null,

    unique (abtest_id, algorithm_id, date_of),

    foreign key (algorithm_id, abtest_id) references algorithm (algorithm_id, abtest_id) on update cascade on delete cascade
);
CREATE TABLE "customer_specific_statistics"
(
    "customer_id"   nat_int NOT NULL,

    "statistics_id" nat_int NOT NULL,
    "dataset_name"  varchar not null references dataset on update cascade on delete cascade,
    foreign key (statistics_id) references statistics (statistics_id) on update cascade on delete cascade,
    foreign key (customer_id,dataset_name) references customer (customer_id, dataset_name) on update cascade on delete cascade,
    PRIMARY KEY ("customer_id", "statistics_id")
);

CREATE TABLE "recommendation"
(
    "recommendation_id" nat_int not null,
    "customer_id"       nat_int not null,
    "statistics_id"     nat_int not null,
    "dataset_name"      varchar not null references dataset on update cascade on delete cascade,
    "article_id"        nat_int NOT NULL,

    foreign key (article_id, dataset_name) references article (article_id, dataset_name) on update cascade on delete cascade,
    foreign key (customer_id, statistics_id) references customer_specific_statistics (customer_id, statistics_id) on update cascade on delete cascade,
    PRIMARY KEY ("recommendation_id", "customer_id", "statistics_id")
);

CREATE TABLE "dynamic_stepsize_var"
(
    statistics_id   int references statistics (statistics_id),
    parameter_name varchar,
    parameter_value  varchar
);


insert into "datascientist" (username, first_name, last_name, birthdate, password, email_address)
values ('xSamx33', 'Sam', 'Roggeman', '2001-06-14', '123456789', 'sam.roggeman@gmail.com');
insert into "admin" (username)
values ('xSamx33')
