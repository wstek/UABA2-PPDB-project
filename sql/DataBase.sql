DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

create domain algorythmname varchar check(VALUE IN ('ItemKNN','Popularity','Recency'));

CREATE EXTENSION citext;
CREATE DOMAIN email AS citext
  CHECK ( value ~ '^[a-zA-Z0-9.!#$%&''*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$' );
CREATE DOMAIN nat_int int check ( value >= 0 );

CREATE TABLE "datascientist" (
  "username" varchar PRIMARY KEY,
  "datascientist_id" serial unique not null,

  "first_name" varchar NOT NULL,
  "last_name" varchar NOT NULL,

  "created_on" timestamp NOT NULL default now(),
  "birthdate" date NOT NULL,
  "password" varchar NOT NULL,
  "email_address" email UNIQUE NOT NULL
);

CREATE TABLE "admin" (
  "admin_id" serial unique not null references "datascientist" (datascientist_id),
  "username" varchar primary key references "datascientist" (username) on update cascade on delete cascade
);

CREATE TABLE "dataset" (
  "name" varchar primary key,
  "uploaded_by" varchar NOT NULL references admin(username) on update cascade on delete cascade
);

CREATE TABLE "customer" (
  "customer_id" nat_int,
  "dataset_name" varchar NOT NULL references dataset(name) on update cascade on delete cascade,
  primary key (customer_id,dataset_name)

);

CREATE TABLE "ABTest" (
  "abtest_id" serial primary key,
  "top_k" nat_int NOT NULL,
  "stepsize" nat_int NOT NULL,
  "start" date NOT NULL,
  "end" date NOT NULL check (start < "end"),
  "dataset_name" varchar NOT NULL references dataset(name) on update cascade on delete cascade,
  "created_on" timestamp NOT NULL default now(),
  "created_by" varchar NOT NULL references "datascientist" (username) on update cascade on delete cascade
);



CREATE TABLE "article" (
  "article_id" nat_int,
  "dataset_name" varchar NOT NULL references dataset(name) on update cascade on delete cascade,
   primary key (article_id,dataset_name)

);
create table "article_attribute"(
  "attribute" varchar not null,
  "value" varchar not null,
  "dataset_name" varchar not null,

  "article_id" nat_int not null,
  foreign key (article_id,dataset_name) references article(article_id,dataset_name) on update cascade on delete cascade,
  primary key ("attribute","article_id", dataset_name)
);




create table "customer_attribute"(
  "dataset_name" varchar not null references dataset(name),

  "attribute" varchar not null,
  "value" varchar not null,
  "customer_id" nat_int not null,
    foreign key (customer_id,dataset_name) references customer(customer_id,dataset_name) on update cascade on delete cascade,

  primary key ("attribute","customer_id",dataset_name)
);
CREATE TABLE "purchase" (
  "dataset_name" varchar not null,
  "customer_id" nat_int NOT NULL,
  article_id nat_int NOT NULL,
  "timestamp" timestamp not null,
  "price" double precision NOT NULL,
    foreign key (article_id,dataset_name) references article(article_id,dataset_name) on update cascade on delete cascade,
  foreign key (customer_id,dataset_name) references customer(customer_id,dataset_name) on update cascade on delete cascade,
PRIMARY KEY  ("dataset_name", "customer_id", "article_id", "timestamp")
);

CREATE TABLE "algorithm" (
  "algorithm_id" serial not null,
  "abtest_id" nat_int not null references "ABTest"(abtest_id) on update cascade on delete cascade,
  "algorithm_name" algorythmname NOT NULL,
  PRIMARY KEY ("algorithm_id", "abtest_id")
);

CREATE TABLE "parameter" (
  "parametername" varchar not null,
  "algorithm_id" nat_int not null,
  "abtest_id" nat_int not null,

  foreign key (algorithm_id,abtest_id) references algorithm(algorithm_id, abtest_id) on update cascade on delete cascade,
  "value" varchar not null,
  PRIMARY KEY ("parametername", "algorithm_id", "abtest_id")
);
-- CREATE TABLE "statistics" (
--   "statistics_id" serial PRIMARY KEY,
--   "datetime" timestamp not null,
--   "algorithm_id" nat_int not null,
--   "abtest_id" int not null,

--   --unique(abtest_id,algorithm_id, datetime),

--   foreign key (algorithm_id,abtest_id) references algorithm(algorithm_id,abtest_id) on update cascade on delete cascade
-- );
CREATE TABLE "customer_specific" (
  "customer_id" nat_int NOT NULL,

  "statistics_id" nat_int NOT NULL references statistics(statistics_id) on update cascade on delete cascade,
  "dataset_name" varchar not null,
  foreign key (customer_id,dataset_name) references customer(customer_id,dataset_name) on update cascade on delete cascade,
  PRIMARY KEY ("customer_id", "statistics_id")
);

CREATE TABLE "recommendation" (
  "algorithm_id" nat_int not null,
  "datetime" timestamp not null,
  "rank" nat_int not null
  "customer_id" nat_int not null,
  -- "statistics_id" nat_int not null,
  "article_id" nat_int NOT NULL,
  foreign key (article_id,dataset_name) references article(article_id,dataset_name) on update cascade on delete cascade,
  foreign key (customer_id,statistics_id) references customer_specific(customer_id,statistics_id) on update cascade on delete cascade,
  PRIMARY KEY ("recomendation_id", "customer_id", "statistics_id")
);

insert into "datascientist" (username, first_name, last_name, birthdate, password, email_address)
values ('xSamx33', 'Sam', 'Roggeman', '2001-06-14', '123456789', 'sam.roggeman@gmail.com');
insert into "admin" (username)
values ('xSamx33')

