


-- drop index if exists idx_dynamic_stepsie_var;
create index idx_dynamic_stepsie_var on dynamic_stepsize_var(statistics_id,parameter_name);

-- drop index if exists idx_dataset_uploader;
create index idx_dataset_uploader on dataset(uploaded_by);

--  PURCHASE
-- drop index if exists idx_purchase_bought_on;
create index idx_purchase_bought_on on purchase(bought_on);
-- drop index if exists idx_purchase_dataset_name;
create index idx_purchase_dataset_name on purchase(dataset_name);
-- drop index if exists idx_purchase_customer;
create index idx_purchase_customer on purchase(customer_id);
-- drop index if exists idx_purchase_article_id;
create index idx_purchase_article_id on purchase(article_id);

-- Statistics
-- drop index if exists idx_statistics_abtest_algorithm_date;
create index idx_statistics_abtest_algorithm_date on statistics(abtest_id, algorithm_id, date_of);
create index idx_statistics_abtest_id on statistics(abtest_id);
-- drop index if exists idx_statistics_statistics_id;
create index idx_statistics_statistics_id on statistics(statistics_id);
-- drop index if exists idx_statistics_on_id;
create index idx_statistics_on_id on statistics(statistics_id);
create index idx_statistics_on_date_of on statistics(date_of);

-- Recommendation
-- drop index if exists idx_recommendation_on_unq_article_id;
create index idx_recommendation_on_unq_article_id on recommendation(unique_article_id);
-- drop index if exists idx_recommendation;
create index idx_recommendation on recommendation("unique_customer_id","recommendation_id");
-- drop index if exists idx_recommendation_on_unq_customer_id;
create index idx_recommendation_on_unq_customer_id on recommendation("unique_customer_id");
-- drop index if exists idx_recommendation_on_statistics_id;
create index idx_recommendation_on_statistics_id on recommendation("statistics_id");

-- ABTEST
-- drop index if exists idx_abtest_on_dataset_name;
create index idx_abtest_on_dataset_name on ab_test(dataset_name);
-- drop index if exists idx_ab_test_by_id;
create index idx_ab_test_by_id on ab_test(abtest_id);
-- drop index if exists idx_ab_test;
create index idx_ab_test on ab_test(created_by,abtest_id);
-- drop index if exists idx_ab_test_on_start_date;
create index idx_ab_test_on_start_date on ab_test(start_date);
-- drop index if exists idx_ab_test_on_end_date;
create index idx_ab_test_on_end_date on ab_test(end_date);


-- drop index if exists idx_algorithm;
create index idx_algorithm on algorithm("algorithm_id", "abtest_id");

-- drop index if exists idx_parameter;
create index idx_parameter on parameter("parameter_name","algorithm_id", "abtest_id");



-- drop index if exists idx_user_username_id;
create index idx_user_username_id on datascientist(username);




-- drop index if exists idx_customer_specific_on_stat_id;
create index idx_customer_specific_on_stat_id on customer_specific_statistics(statistics_id);

-- drop index if exists idx_customer_specific_on_unq_customer_id;
create index idx_customer_specific_on_unq_customer_id on customer_specific_statistics(unique_customer_id);



-- drop index if exists idx_algorithm_on_abtest_id;
create index idx_algorithm_on_abtest_id on algorithm(abtest_id);

-- drop index if exists idx_customer_attribute_on_unq_customer_id;
create index idx_customer_attribute_on_unq_customer_id on customer_attribute(customer_id,dataset_name);
-- drop index if exists idx_article_attribute_on_unq_article_id;
create index idx_article_attribute_on_unq_article_id on article_attribute(article_id,dataset_name);

-- drop index if exists idx_customer_dataset_name;
create index idx_customer_dataset_name on customer( dataset_name);

-- drop index if exists idx_customer_unique_id;
create index idx_customer_unique_id on customer(unique_customer_id);

-- drop index if exists idx_customer_dataset_id;
create index idx_customer_dataset_id on customer(customer_id, dataset_name);

-- drop index if exists idx_customer_dataset;
create index idx_customer_dataset on customer( dataset_name);

-- drop index if exists idx_article_dataset_name;
create index idx_article_dataset_name on article( dataset_name);

-- drop index if exists idx_article_unique_id;
create index idx_article_unique_id on article(unique_article_id);

-- drop index if exists idx_article_dataset_id;
create index idx_article_dataset_id on article(article_id, dataset_name);

-- drop index if exists idx_article_dataset;
create index idx_article_dataset on article( dataset_name);


