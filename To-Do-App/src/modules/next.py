import pymysql

def next(db_config):
    """
    Return the next (earliest due) not-done task as a tuple
    (item, type, started, due, done), or None when no task found.
    """

    conn = None
    try:
        conn = pymysql.connect(**db_config)
        with conn.cursor() as cursor:
            sql = (
                "SELECT item, type, started, due, done FROM ToDoData "
                "WHERE done IS NULL ORDER BY due ASC LIMIT 1"
            )

            cursor.execute(sql)
            row = cursor.fetchone()
            if not row:
                return None

            return row
    except pymysql.MySQLError as err:
        print(f"Database error: {err}")
        return None
    except Exception as e:
        msg = str(e)
        if "cryptography" in msg:
            print(
                "Error: cryptography package required by MySQL auth. pip install cryptography"
            )
        else:
            print(f"Error retrieving next task: {e}")
        return None
    finally:
        if conn is not None:
            try:
                conn.close()
            except Exception:
                pass