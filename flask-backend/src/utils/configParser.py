from configparser import ConfigParser


def __configToDict(filename, section):
    parser = ConfigParser()
    parser.read(filename)

    db_data = {}
    if parser.has_section(section):
        params = parser.items(section)

        for param in params:
            db_data[param[0]] = param[1]
    else:
        raise Exception(f"Section {section} not found in the {filename} file")

    return db_data


def configLogger(filename='logger.ini', section='logger'):
    # todo check if fields are present
    return __configToDict(filename, section)


def configDatabase(filename='database.ini', section='postgresql'):
    # todo check if fields are present
    return __configToDict(filename, section)
