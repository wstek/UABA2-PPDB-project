import os
import pathlib

REL_PATH_TO_PROJECT_FOLDER = "../../"


def getAbsPathFromProjectRoot(rel_path: str):
    return pathlib.Path(os.path.dirname(os.path.abspath(__file__)), REL_PATH_TO_PROJECT_FOLDER, rel_path).resolve()


if __name__ == "__main__":
    print(getAbsPathFromProjectRoot(""))
