from tabulate import tabulate
import csv
import os
from datetime import date


def main():
    print("\n**Family Expenses Manager**")
    running = True

    while running:
        instructions = [
        {"Key": "C", "Action": "Check Status"},
        {"Key": "E", "Action": "Expenses"},
        {"Key": "F", "Action": "Family"},
        {"Key": "Q", "Action": "Quit"}
    ]
        action = get_user_choice(instructions)

        if action == "C":
            running = check_status()
        elif action == "E":
            running = expenses()
        elif action == "F":
            running = family()
        else:
            running = False
            print("\nGoodbye!\n")



def get_user_choice(menu):
    while True:
        print(tabulate(menu, headers="keys", tablefmt="rounded_outline"))
        choice = input("Choose one action to proceed: ").strip().upper()
        if choice in [item["Key"] for item in menu]:
            return choice
        print("Invalid action, try again.")


def check_status():
    family_file = "family.csv"
    expenses_file = "expenses.csv"

    if not os.path.exists(family_file):
        print("\nThere are no family members. Please choose another option.")
        return True

    with open(family_file, mode='r') as file:
        family_reader = list(csv.DictReader(file))

    if not os.path.exists(expenses_file):
        print("\nThere are no expenses. Please choose another option.")
        return True

    with open(expenses_file, mode='r') as file:
        expenses_reader = list(csv.DictReader(file))

    total_salary = calculate_total_salary(family_file)
    total_expenses = calculate_total_expenses(expenses_file)

    net_balance = total_salary - total_expenses

    table_data = [
        ["Total Salary", f"$ {total_salary}"],
        ["Total Expenses", f"$ {total_expenses}"],
        ["",""],
        ["Net Balance", f"$ {net_balance}"]]

    print("\nFamily Financial Checkup")
    print(tabulate(table_data, tablefmt="rounded_outline"))

    return True

def family():
    instructions = [
        {"Key": "A", "Action": "Add new family member"},
        {"Key": "E", "Action": "Edit a family member's data"},
        {"Key": "C", "Action": "Check a family member's financial data"},
        {"Key": "D", "Action": "Delete a family member"},
        {"Key": "Q", "Action": "Quit to Main Menu"}
    ]

    csv_file = "family.csv"

    if not os.path.exists(csv_file):
        with open(csv_file, mode='w', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(["ID", "First Name", "Last Name", "Salary", "Entry Date"])

    while True:
        print(tabulate(instructions, headers="keys", tablefmt="rounded_outline"))
        family_action = input("Choose one action to proceed: ").strip().upper()

        if family_action == "A":
            add_family_member(csv_file)
        elif family_action == "E":
            edit_family_member(csv_file)
        elif family_action == "C":
            check_family_member(csv_file)
        elif family_action == "D":
            delete_family_member(csv_file)
        elif family_action == "Q":
            return True
        else:
            print("Invalid action, try again.")
    return True


def add_family_member(csv_file):
    print("Registering a new family member")
    first_name = input("Enter first name: ")
    last_name = input("Enter last name: ")
    salary = input("Enter salary: $")
    entry_date = date.today()

    if not os.path.exists(csv_file) or os.path.getsize(csv_file) == 0:
        with open(csv_file, mode='w', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(["ID", "First Name", "Last Name", "Salary", "Entry Date"])
        entry_id = 1
    else:
        with open(csv_file, mode='r') as file:
            reader = csv.reader(file)
            next(reader)  # Skip the header row
            entry_id = sum(1 for row in reader) + 1

    with open(csv_file, mode='a', newline='') as file:
        writer = csv.writer(file)
        writer.writerow([entry_id, first_name, last_name, salary, entry_date])

    print("New family member was created!\n")


def edit_family_member(csv_file):
    with open(csv_file, mode='r') as file:
        reader = list(csv.DictReader(file))
        if not reader:
            print("There are no family members")
            return

        selected_member_id = select_family_member_id(reader)

        if selected_member_id == 0:
            print("Update canceled.")
            return

        selected_member = reader[selected_member_id - 1]

        updated_first_name = input(f"Enter new first name for {selected_member['First Name']}: ")
        updated_last_name = input(f"Enter new last name for {selected_member['Last Name']}: ")
        updated_salary = input(f"Enter new salary for {selected_member['Salary']}: $")

        selected_member['First Name'] = updated_first_name
        selected_member['Last Name'] = updated_last_name
        selected_member['Salary'] = updated_salary

        with open(csv_file, mode='w', newline='') as file:
            fieldnames = ["ID", "First Name", "Last Name", "Salary", "Entry Date"]
            writer = csv.DictWriter(file, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(reader)

        print("Family member updated.")


def check_family_member(csv_file):
    with open(csv_file, mode='r') as file:
        reader = list(csv.DictReader(file))
        if not reader:
            print("There are no family members")
            return

        selected_member_id = select_family_member_id(reader)

        if selected_member_id == 0:
            print("Check canceled.")
            return

        selected_member = reader[selected_member_id - 1]

        print(tabulate([selected_member], headers="keys", tablefmt="rounded_outline"))
        return


def delete_family_member(csv_file):
    with open(csv_file, mode='r') as file:
        reader = list(csv.DictReader(file))
        if not reader:
            print("There are no family members")
            return

        selected_member_id = select_family_member_id(reader)

        if selected_member_id == 0:
            print("Delete canceled.")
            return

        selected_member = reader[selected_member_id - 1]

        print("The following member was selected: ")
        print(tabulate([selected_member], headers="keys", tablefmt="rounded_outline"))

        confirm_deletion = input("Are you sure you want to delete this family member?(yes/no) ").strip().lower()

        if confirm_deletion == "yes":
            del reader[selected_member_id - 1]

            with open(csv_file, mode='w', newline='') as file:
                fieldnames = ["ID", "First Name", "Last Name", "Salary", "Entry Date"]
                writer = csv.DictWriter(file, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(reader)
        else:
            print("Confirmation canceled")
            return


def select_family_member_id(family_data):
    print("Select a family member:")
    print(tabulate(family_data, headers="keys", tablefmt="rounded_outline"))

    while True:
        try:
            selection = int(input("Select a member's ID or 0 to cancel: "))
            if 0 <= selection <= len(family_data):
                return selection
            print("Invalid ID. Please select a valid ID or 0 to cancel.")
        except ValueError:
            print("Invalid ID. Please enter a number or 0 to cancel.")
    return 0


def expenses():
    instructions = [
        {"Key": "A", "Action": "Add new expenses"},
        {"Key": "E", "Action": "Edit an expense"},
        {"Key": "C", "Action": "Check current expenses"},
        {"Key": "D", "Action": "Delete an expense"},
        {"Key": "Q", "Action": "Quit to Main Menu"}
    ]

    csv_file = "expenses.csv"

    if not os.path.exists(csv_file):
        with open(csv_file, mode='w', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(["ExpenseID", "Description", "Amount", "Entry Date"])

    while True:
        print(tabulate(instructions, headers="keys", tablefmt="rounded_outline"))
        expense_action = input("Choose one action to proceed: ").strip().upper()

        if expense_action == "A":
            add_expense(csv_file)
        elif expense_action == "E":
            edit_expense(csv_file)
        elif expense_action == "C":
            check_expenses(csv_file)
        elif expense_action == "D":
            delete_expense(csv_file)
        elif expense_action == "Q":
            return True
        else:
            print("Invalid action, try again.")
    return True


def add_expense(csv_file):
    print("Adding a new expense:")
    description = input("Enter the expense description: ")
    amount = input("Enter the expense amount: $")
    entry_date = date.today()

    if not os.path.exists(csv_file):
        with open(csv_file, mode='w', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(["ExpenseID", "Description", "Amount", "Entry Date"])
        ExpenseID = 1
    else:
        with open(csv_file, mode='r') as file:
            reader = csv.DictReader(file)
            expenses = list(reader)

            for expense in expenses:
                if expense['Description'] == description:
                    print("Expense already exists.")
                    return

            ExpenseID = len(expenses) + 1

    new_expense = {"ExpenseID": ExpenseID, "Description": description, "Amount": amount, "Entry Date": entry_date}
    expenses.append(new_expense)

    with open(csv_file, mode='a', newline='') as file:
        writer = csv.DictWriter(file, fieldnames=["ExpenseID", "Description", "Amount", "Entry Date"])
        writer.writerow(new_expense)

    print("New expense was added!\n")


def edit_expense(csv_file):
    print("Select the expense to edit:")

    expenses = load_expenses(csv_file)

    if not expenses:
        print("No expenses found.")
        return

    print(tabulate(expenses, headers="keys", tablefmt="rounded_outline"))

    while True:
        selected_id = input("Enter the position (ID) of the expense to edit or 0 to cancel: ").strip()

        if selected_id == "0":
            return

        try:
            selected_id = int(selected_id)
            if not (1 <= selected_id <= len(expenses)):
                print("Invalid ID. Please enter a valid position.")
            else:
                break
        except ValueError:
            print("Invalid input. Please enter a valid position or 0 to cancel.")

    selected_expense = expenses[selected_id - 1]

    updated_description = input(f"Enter the updated description for ID {selected_id}: ")
    updated_amount = input(f"Enter the updated amount for ID {selected_id}: $")

    selected_expense['Description'] = updated_description
    selected_expense['Amount'] = updated_amount

    save_expenses(expenses, csv_file)

    print(f"Expense ID {selected_id} updated!\n")


def delete_expense(csv_file):
    expenses = load_expenses(csv_file)

    if not expenses:
        print("No expenses found.")
        return

    print("Select the expense to delete:")
    print(tabulate(expenses, headers="keys", tablefmt="fancy_grid"))

    while True:
        selected_id = input("Enter the position (ID) of the expense to delete or 0 to cancel: ").strip()

        if selected_id == "0":
            return

        try:
            selected_id = int(selected_id)
            if not (1 <= selected_id <= len(expenses)):
                print("Invalid ID. Please enter a valid position.")
            else:
                break
        except ValueError:
            print("Invalid input. Please enter a valid position or 0 to cancel.")

    selected_expense = expenses[selected_id - 1]

    print("The following expense will be deleted:")
    print(tabulate([selected_expense], headers="keys", tablefmt="fancy_grid"))

    confirm_deletion = input("Are you sure? (yes/no): ").strip().lower()

    if confirm_deletion == "yes":
        expenses.pop(selected_id - 1)
        save_expenses(expenses, csv_file)
        print(f"Expense ID {selected_id} deleted!\n")
    else:
        print("Deletion canceled.")


def load_expenses(csv_file):
    expenses = []

    if os.path.exists(csv_file):
        with open(csv_file, mode='r') as file:
            reader = csv.DictReader(file)
            expenses = list(reader)
    return expenses


def save_expenses(expenses, csv_file):
    with open(csv_file, mode='w', newline='') as file:
        writer = csv.DictWriter(file, fieldnames=["ExpenseID", "Description", "Amount", "Entry Date"])
        writer.writeheader()
        writer.writerows(expenses)


def check_expenses(csv_file):
    expenses = []

    with open(csv_file, mode='r') as file:
        reader = csv.DictReader(file)
        expenses = list(reader)

    if expenses:
        print(tabulate(expenses, headers="keys", tablefmt="rounded_outline"))
    else:
        print("No expenses found.")
    return expenses


def calculate_total_salary(csv_file):
    total_salary = 0

    if os.path.exists(csv_file):
        with open(csv_file, mode='r') as file:
            reader = csv.DictReader(file)
            for row in reader:
                salary = int(row['Salary'])
                total_salary += salary
    return total_salary


def calculate_total_expenses(csv_file):
    total_expenses = 0

    if os.path.exists(csv_file):
        with open(csv_file, mode='r') as file:
            reader = csv.DictReader(file)
            for row in reader:
                amount = int(row['Amount'])
                total_expenses += amount
    return total_expenses   


if __name__ == "__main__":
    main()
