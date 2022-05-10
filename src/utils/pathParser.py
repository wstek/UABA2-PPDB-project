import pathlib
import os

REL_PATH_TO_ROOT_FOLDER = "./../"


def getAbsPathFromRelSrc(rel_path: str):
    return pathlib.Path(os.path.dirname(os.path.abspath(__file__)) + REL_PATH_TO_ROOT_FOLDER + rel_path).resolve()


if __name__ == "__main__":
    print(getAbsPathFromRelSrc("config"))
