import csv
import os
import pytest
from datetime import date
from project import add_family_member, edit_family_member, delete_family_member
from project import add_expense, edit_expense, delete_expense
from unittest.mock import patch


def main():
    test_add_family_member()
    test_edit_family_member()
    test_delete_family_member()


def test_add_family_member():
    test_csv_file = "test_add_family.csv"

    if not os.path.exists(test_csv_file) or os.path.getsize(test_csv_file) == 0:
        with open(test_csv_file, mode='w', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(["ID", "First Name", "Last Name", "Salary", "Entry Date"])
        entry_id = 1
    else:
        with open(test_csv_file, mode='r') as file:
            reader = csv.reader(file)
            next(reader)
            entry_id = sum(1 for row in reader) + 1

    with patch('builtins.input', side_effect=["Ricardo", "Miranda", "1000"]):
        add_family_member(test_csv_file)

    with open(test_csv_file, mode='r', newline='') as file:
        reader = csv.reader(file)
        next(reader)

        for row in reader:
            assert row == [str(entry_id), "Ricardo", "Miranda", "1000", date.today().isoformat()]

    os.remove(test_csv_file)


def test_edit_family_member():
    test_csv_file = "test_edit_family.csv"
    entry_id = 1

    if not os.path.exists(test_csv_file) or os.path.getsize(test_csv_file) == 0:
        with open(test_csv_file, mode='w', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(["ID", "First Name", "Last Name", "Salary", "Entry Date"])
            writer.writerow([str(entry_id), "Ricardo", "Miranda", "1000", "2023-10-29"])
    else:
        pass

    with patch('builtins.input', side_effect=["1", "Lais", "Cicero", "2000"]):
        edit_family_member(test_csv_file)

    with open(test_csv_file, mode='r', newline='') as file:
        reader = csv.reader(file)
        next(reader)

        for row in reader:
            assert row == [str(entry_id), "Lais", "Cicero", "2000", "2023-10-29"]

    os.remove(test_csv_file)


def test_delete_family_member():
    test_csv_file = "test_delete_family.csv"
    entry_id = 1

    if not os.path.exists(test_csv_file) or os.path.getsize(test_csv_file) == 0:
        with open(test_csv_file, mode='w', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(["ID", "First Name", "Last Name", "Salary", "Entry Date"])
            writer.writerow([str(entry_id), "Ricardo", "Miranda", "1000", "2023-10-29"])
    else:
        pass

    with patch('builtins.input', side_effect=["1", "yes"]):
        delete_family_member(test_csv_file)

    with open(test_csv_file, mode='r', newline='') as file:
        reader = csv.reader(file)
        next(reader)

        for row in reader:
            assert row == []

    os.remove(test_csv_file)


def test_add_expense():
    test_csv_file = "test_add_expense.csv"

    if not os.path.exists(test_csv_file) or os.path.getsize(test_csv_file) == 0:
        with open(test_csv_file, mode='w', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(["ExpenseID", "Description", "Amount", "Entry Date"])
    else:
        pass

    with patch('builtins.input', side_effect=["House", "200"]):
        add_expense(test_csv_file)

    with open(test_csv_file, mode='r', newline='') as file:
        reader = csv.reader(file)
        next(reader)

        for row in reader:
            csv_date = str(date.today())
            assert row == ["1", "House", "200", csv_date]

    os.remove(test_csv_file)


def test_edit_expense():
    test_csv_file = "test_edit_expense.csv"
    entry_id = 1

    if not os.path.exists(test_csv_file) or os.path.getsize(test_csv_file) == 0:
        with open(test_csv_file, mode='w', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(["ExpenseID", "Description", "Amount", "Entry Date"])
            writer.writerow([entry_id, "House", "200", "2023-10-29"])
    else:
        pass

    with patch('builtins.input', side_effect=["1", "Country House", "400"]):
        edit_expense(test_csv_file)

    with open(test_csv_file, mode='r', newline='') as file:
        reader = csv.reader(file)
        next(reader)

        for row in reader:
            assert row == ["1", "Country House", "400", "2023-10-29"]

    os.remove(test_csv_file)


def test_delete_expenses():
    test_csv_file = "test_delete_expense.csv"
    entry_id = 1

    if not os.path.exists(test_csv_file) or os.path.getsize(test_csv_file) == 0:
        with open(test_csv_file, mode='w', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(["ExpenseID", "Description", "Amount", "Entry Date"])
            writer.writerow([entry_id, "House", "200", "2023-10-29"])
    else:
        pass

    with patch('builtins.input', side_effect=["1","yes"]):
        delete_expense(test_csv_file)

    with open(test_csv_file, mode='r', newline='') as file:
        reader = csv.reader(file)
        next(reader)

        for row in reader:
            assert row == []

    os.remove(test_csv_file)


if __name__ == "__main__":
    main()
