create user scrapimmo createdb;

create DATABASE scrapimmodb;

create table ad
(
  id varchar(40) not null primary key,
  data json,
  create_date timestamp with time zone,
  update_date timestamp with time zone
);