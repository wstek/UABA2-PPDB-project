#!/bin/bash

drop_database_script_path="./../sql/DropDataBase.sql"
init_database_script_path="./../sql/InitDataBase.sql"
index_database_script_path="./../sql/Indexes.sql"
account_database_script_path="./../sql/CreateTestAccount.sql"

psql main_database -U app -f "$drop_database_script_path"
psql main_database -U app -f "$init_database_script_path"
psql main_database -U app -f "$index_database_script_path"
psql main_database -U app -f "$account_database_script_path"