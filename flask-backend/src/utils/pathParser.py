import os
import pathlib

REL_PATH_TO_PROJECT_FOLDER = "../../"


def getAbsPathFromProjectRoot(rel_path: str):
    return pathlib.Path(os.path.dirname(os.path.abspath(__file__)), REL_PATH_TO_PROJECT_FOLDER, rel_path).resolve()


def checkDirExistsAndCreate(abs_path: str):
    if not os.path.exists(abs_path):
        os.makedirs(abs_path)


if __name__ == "__main__":
    print(getAbsPathFromProjectRoot(""))
