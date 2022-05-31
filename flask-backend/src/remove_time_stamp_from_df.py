import os
import sys

import pandas as pd

# appends parent directory to the python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from src.utils.pathParser import getAbsPathFromProjectRoot


if __name__ == "__main__":
    new_df = pd.read_csv(getAbsPathFromProjectRoot("../datasets/dataset2/kz.csv"))

    new_df["event_time"] = pd.to_datetime(new_df["event_time"]).dt.date

    new_df.drop_duplicates(inplace=True)

    new_df.to_csv(getAbsPathFromProjectRoot("../datasets/dataset2/electronics_store_clean.csv"))
