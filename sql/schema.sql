DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

create domain algorythmname varchar check(VALUE IN ('a','b','c'));

CREATE TABLE "users" (
  "username" varchar PRIMARY KEY,

--   "first_name" varchar NOT NULL,
--   "last_name" varchar NOT NULL,
  "created_on" timestamp NOT NULL default now(),
--   "birthdate" date NOT NULL,
  "password" varchar NOT NULL,
  "email_address" varchar UNIQUE NOT NULL
);

CREATE TABLE "admin" (
  "username" varchar primary key references users(username)
);

CREATE TABLE "dataset" (
  "name" varchar primary key,
  "uploaded_by" varchar NOT NULL references admin(username)
);

CREATE TABLE "customer" (
  "customer_id" int not null primary key,
  "dataset_name" varchar NOT NULL references dataset(name)
);

CREATE TABLE "ABTest" (
  "abtest_id" int primary key,
  "top_k" int NOT NULL,
  "stepsize" int NOT NULL,
  "start" date NOT NULL,
  "end" date NOT NULL,
  "dataset_name" varchar NOT NULL references dataset(name),
  "created_on" timestamp NOT NULL default now(),
  "created_by" varchar NOT NULL references users(username)
);



CREATE TABLE "article" (
  "article_id" int primary key ,
  "dataset_name" varchar NOT NULL references dataset(name),
  "value" varchar not null
);
create table "article_attribute"(
  "attribute" varchar not null,
  "value" varchar not null,
  "article_id" int not null references article(article_id),
  primary key ("attribute","article_id")
);
create table "customer_attribute"(
  "attribute" varchar not null,
  "value" varchar not null,
  "customer_id" int not null references customer(customer_id),
  primary key ("attribute","customer_id")
);
CREATE TABLE "purchase" (
  "dataset_name" varchar not null references dataset(name),
  "customer_id" int NOT NULL references customer(customer_id) ,
  "item_id" int NOT NULL references article(article_id),
  "timestamp" timestamp not null,
  "price" integer NOT NULL,
--   UNIQUE ("dataset_id", "customer_id", "item_id", "timestamp"),
  PRIMARY KEY  ("dataset_name", "customer_id", "item_id", "timestamp")
);

CREATE TABLE "algorithm" (
  "algorithm_id" int not null,
  "abtest_id" int not null references "ABTest"(abtest_id),
  "algorithm_name" algorythmname NOT NULL,
  PRIMARY KEY ("algorithm_id", "abtest_id")
);

CREATE TABLE "parameter" (
  "parametername" varchar not null,
  "algorithm_id" int not null,
  "abtest_id" int not null,
  foreign key (algorithm_id,abtest_id) references algorithm(algorithm_id, abtest_id),
  "value" varchar not null,
  PRIMARY KEY ("parametername", "algorithm_id", "abtest_id")
);
CREATE TABLE "statistics" (
  "statistics_id" int PRIMARY KEY,
  "datetime" timestamp not null,
  "algorithm_id" int not null,
  "abtest_id" int not null,
  foreign key (algorithm_id,abtest_id) references algorithm(algorithm_id,abtest_id)
);
CREATE TABLE "customer_specific" (
  "customer_id" int NOT NULL references customer(customer_id),
  "statistics_id" int NOT NULL references statistics(statistics_id),
  "clicked_through" boolean default false,
  PRIMARY KEY ("customer_id", "statistics_id")
);
CREATE TABLE "recommendation" (
  "recomendation_id" int not null,
  "article_id" int NOT NULL references article(article_id),
  "customer_id" int not null,
  "statistics_id" int not null,
  foreign key (customer_id,statistics_id) references customer_specific(customer_id,statistics_id),
  "bought" boolean default false,
  PRIMARY KEY ("recomendation_id", "customer_id", "statistics_id")
);
