alter table algorithm
    drop column algorithm_name;

select *
from attr_abtest_18_30d
order by attributions desc;



drop materialized view attr_abtest_18_30d;

refresh materialized view attr_abtest_18_30d;
create materialized view attr_abtest_22_30d as
select algorithm_id, bought_on, unique_customer_id, count(distinct (unique_article_id)) as attributions, sum(price)/count(distinct (unique_article_id)) revenue_per_attr

from (select abtest_id, start_date, end_date
      from ab_test
      where abtest_id = 22) ab_test
         natural join algorithm
         natural join statistics
         natural join recommendation
         natural join customer
         natural join article
         join purchase p on article.article_id = p.article_id and article.dataset_name = p.dataset_name and
                            customer.customer_id = p.customer_id and customer.dataset_name = p.dataset_name and
                            date_of between bought_on - interval '30 days' and bought_on
where bought_on between start_date and end_date
group by algorithm_id, bought_on, unique_customer_id;



alter table customer_specific_statistics add column clicked_through bool not null default false;

update customer_specific_statistics css
set clicked_through = ctr.clicked_through
from
(select algorithm_id, statistics_id, unique_customer_id, case when count(distinct (unique_article_id)) > 0 then true else false end as clicked_through
from (select abtest_id, start_date, end_date,stepsize
      from ab_test where abtest_id = 83
      ) ab_test
         natural join algorithm
         natural join statistics
         natural join recommendation
         natural join customer
         natural join article
         join purchase p on article.article_id = p.article_id and article.dataset_name = p.dataset_name and
                            customer.customer_id = p.customer_id and customer.dataset_name = p.dataset_name and
                            bought_on between date_of and date_of + stepsize
where bought_on between start_date and end_date
group by algorithm_id, statistics_id, unique_customer_id ) ctr
where ctr.unique_customer_id = css.unique_customer_id and css.statistics_id = ctr.statistics_id
;



select count(*) from customer_specific_statistics where clicked_through = true;



select algorithm_id, sum(case when clicked_through then 1 else 0 end)::float8/count(distinct customer_specific_statistics)
from customer_specific_statistics natural join statistics natural join algorithm natural join ab_test
where abtest_id = 18
group by algorithm_id;

select algorithm_id,algorithm_name,unique_customer_id, sum(case when clicked_through then 1 else 0 end)::float8/count(distinct customer_specific_statistics) as CTR
from customer_specific_statistics natural join statistics natural join named_algorithm natural join ab_test
where abtest_id = 18 and date_of between '2020-01-01' and '2020-01-10'
group by algorithm_id,unique_customer_id,algorithm_name
order by unique_customer_id, algorithm_id
;


select algorithm_id,algorithm_name,date_of, sum(case when clicked_through then 1 else 0 end)::float8/count(distinct customer_specific_statistics) as CTR
from customer_specific_statistics natural join statistics natural join named_algorithm natural join ab_test
where abtest_id = 18 and date_of between '2020-01-01' and '2020-01-10'
group by algorithm_id,date_of,algorithm_name
order by date_of, algorithm_id
;



select * from algorithm natural join statistics natural join customer_specific_statistics
where abtest_id = 18 and date_of between '2020-01-01' and '2020-01-10' and unique_customer_id = 525627
;

select *
-- select algorithm_id, bought_on, sum(attributions) / (
--                         select count(*)
--                         from purchase b natural join customer c
--                         where b.bought_on between '2020-01-01' and '2020-01-09'
--                         ) ATR
from "attr_abtest_18_30d"
         join (select algorithm_id, date, 0 as atr
               from algorithm
                        natural join statistics
                        natural join (select generate_series(start_date::date, end_date::date,
                                                             '1 day'::interval)::date date
                                      from ab_test
                                      where abtest_id = 18) dates) algorithms
              on algorithms.algorithm_id = attr_abtest_18_30d.algorithm_id
-- where bought_on between '2020-01-01' and '2020-01-09'
-- group by algorithm_id, bought_on
order by bought_on desc, algorithms.algorithm_id
;

select generate_series::date
from generate_series('2020-01-01', '2020-01-10', '1 day'::interval);
select algorithm_id,
       bought_on,
       sum(attributions) / (select count(*)
                            from purchase b
                                     natural join customer c
                            where b.bought_on between '2020-01-01' and '2020-01-09') ATR
from "attr_abtest_18_30d"
where bought_on between '2020-01-01' and '2020-01-09'
group by algorithm_id, bought_on;

select *
from (select algorithm_id,
             bought_on,
             sum(attributions) / (select count(*)
                                  from purchase
                                           natural join customer
                                           natural join ab_test
                                  where bought_on between start_date and end_date
                                    and abtest_id = 18) ATR
      from "attr_abtest_18_30d"
      where bought_on between '2020-01-01' and '2020-01-09'
      group by algorithm_id, bought_on
      order by bought_on, algorithm_id) a
         natural join named_algorithm
;

select *
from named_algorithm
where abtest_id = 18
order by abtest_id;
select count(*)
from attr_abtest_18_30d
         natural join ab_test
where abtest_id = 18;

select *
from (select algorithm_id,
             bought_on,
             to_char(sum(attributions) / (select count(*)
                                          from purchase
                                                   natural join customer
                                                   natural join ab_test
                                          where bought_on between start_date and end_date
                                            and abtest_id = 18)::float8, 'FM999999990.9999') ATR
      from "attr_abtest_18_30d"
               natural join algorithm
               natural join ab_test
      where bought_on between start_date and end_date
      group by algorithm_id, bought_on
      order by atr desc) result
         natural join named_algorithm;

SELECT unique_article_id, MIN(bought_on)
FROM purchase
         natural join article
WHERE bought_on <= {current_day} and dataset_name = 'H_M'
GROUP BY unique_article_id
ORDER BY MIN (bought_on) DESC
LIMIT 10;

SELECT SUBQUERY.unique_article_id, count(*) AS popular_items
FROM (SELECT *
      FROM purchase
               natural join article
      WHERE bought_on = '{start_date}') AS SUBQUERY
GROUP BY SUBQUERY.unique_article_id
ORDER BY popular_items DESC
LIMIT 10;

SELECT unique_article_id, count(*)  times_bought
      FROM purchase
               natural join article
      WHERE bought_on BETWEEN '{current_date}'::date - interval '7 days' AND '{current_date}'::date
GROUP BY unique_article_id
ORDER BY times_bought DESC
LIMIT {k};

select ('2020-01-10'::date - 7)::date, '2020-01-10'::date + 1;

select algorithm_id, unique_customer_id, to_char(sum(attributions * revenue_per_attr )::float8, 'FM999999990.9999' ) as "ARPU@30"
from attr_abtest_18_30d natural join named_algorithm
where bought_on between '2020-01-01' and '2020-01-9'
group by algorithm_id, unique_customer_id;


select algorithm_id, unique_customer_id, to_char(sum(attributions * revenue_per_attr )::float8, 'FM999999990.9999' ) as "ARPU@30"
from attr_abtest_22_30d
where bought_on between '2020-01-01' and '2020-01-9'
group by algorithm_id, unique_customer_id;

select distinct bought_on, unique_customer_id
from purchase natural join customer natural join ab_test
where bought_on between '2020-01-01' and '2020-01-9'
order by bought_on, unique_customer_id;

select distinct customer_id,article_id,unique_customer_id, unique_article_id, bought_on
from purchase natural join customer natural join article
where dataset_name = 'H_M' and  bought_on between '2020-01-01' and '2020-01-9'
order by bought_on, unique_customer_id;

select * from ab_test natural join algorithm
where abtest_id =21 ;

reindex database ppdb_database;

        select algorithm_id,algorithm_name,date_of,
            sum(case when clicked_through then 1 else 0 end)::float8/count(distinct customer_specific_statistics) as CTR
        from customer_specific_statistics natural join statistics natural join named_algorithm natural join ab_test
        where abtest_id = 22 and date_of between start_date and end_date
        group by algorithm_id,date_of,algorithm_name
        order by date_of, algorithm_id

delete from dataset where name = 'H_M'

select * from purchase,article,customer,customer_attribute, article_attribute,dataset,datascientist,admin,ab_test,algorithm,parameter, statistics,dynamic_stepsize_var;
select * from  attr