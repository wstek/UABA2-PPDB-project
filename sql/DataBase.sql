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

  "first_name" varchar NOT NULL,
  "last_name" varchar NOT NULL,

  "created_on" timestamp NOT NULL default now(),
  "birthdate" date NOT NULL,
  "password" varchar NOT NULL,
  "email_address" email UNIQUE NOT NULL
);

CREATE TABLE "admin" (
  "username" varchar primary key references "datascientist" (username) on update cascade on delete cascade
);

CREATE TABLE "dataset" (
  "name" varchar primary key,
  "uploaded_by" varchar NOT NULL references admin(username) on update cascade on delete cascade
);

CREATE TABLE "customer" (
  "customer_id" nat_int primary key,
  "dataset_name" varchar NOT NULL references dataset(name) on update cascade on delete cascade
);

CREATE TABLE "ABTest" (
  "abtest_id" nat_int primary key,
  "top_k" nat_int NOT NULL,
  "stepsize" nat_int NOT NULL,
  "start" date NOT NULL,
  "end" date NOT NULL check (start < "end"),
  "dataset_name" varchar NOT NULL references dataset(name) on update cascade on delete cascade,
  "created_on" timestamp NOT NULL default now(),
  "created_by" varchar NOT NULL references "datascientist" (username) on update cascade on delete cascade
);



CREATE TABLE "article" (
  "article_id" nat_int primary key ,
  "dataset_name" varchar NOT NULL references dataset(name) on update cascade on delete cascade
);
create table "article_attribute"(
  "attribute" varchar not null,
  "value" varchar not null,

  "article_id" nat_int not null references article(article_id) on update cascade on delete cascade,
  primary key ("attribute","article_id")
);
create table "customer_attribute"(
  "attribute" varchar not null,
  "value" varchar not null,
  "customer_id" nat_int not null references customer(customer_id) on update cascade on delete cascade,
  primary key ("attribute","customer_id")
);
CREATE TABLE "purchase" (
  "dataset_name" varchar not null references dataset(name) on update cascade on delete cascade,
  "customer_id" nat_int NOT NULL references customer(customer_id) on update cascade on delete cascade,
  article_id nat_int NOT NULL references article(article_id) on update cascade on delete cascade,
  "timestamp" timestamp not null,
  "price" double precision NOT NULL,
  PRIMARY KEY  ("dataset_name", "customer_id", "article_id", "timestamp")
);

CREATE TABLE "algorithm" (
  "algorithm_id" nat_int not null,
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
CREATE TABLE "statistics" (
  "statistics_id" nat_int PRIMARY KEY,
  "datetime" timestamp not null,
  "algorithm_id" nat_int not null,
  "abtest_id" int not null,
  foreign key (algorithm_id,abtest_id) references algorithm(algorithm_id,abtest_id) on update cascade on delete cascade
);
CREATE TABLE "customer_specific" (
  "customer_id" nat_int NOT NULL references customer(customer_id) on update cascade on delete cascade,
  "statistics_id" nat_int NOT NULL references statistics(statistics_id) on update cascade on delete cascade,
  PRIMARY KEY ("customer_id", "statistics_id")
);
CREATE TABLE "recommendation" (
  "recomendation_id" nat_int not null,
  "article_id" nat_int NOT NULL references article(article_id) on update cascade on delete cascade,
  "customer_id" nat_int not null,
  "statistics_id" nat_int not null,
  foreign key (customer_id,statistics_id) references customer_specific(customer_id,statistics_id) on update cascade on delete cascade,
  PRIMARY KEY ("recomendation_id", "customer_id", "statistics_id")
);

insert into "datascientist" (username, first_name, last_name, birthdate, password, email_address)
values ('xSamx33', 'Sam', 'Roggeman', '2001-06-14', '123456789', 'sam.roggeman@gmail.com');
insert into "admin" (username)
values ('xSamx33')

