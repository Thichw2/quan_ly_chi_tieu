import axios from 'axios'
import apiUrl from './apiUrl'
import API_URL from './apiUrl';

export async function Login(username: string, password: string) {
    const response = await axios.post(
        `${apiUrl}/auth/login`,
        new URLSearchParams({
            username: username,
            password: password
        }),
        {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
    );
    return response;
}

export async function RegisterUser(
    username: string, 
    email: string, 
    password: string,
    fullName: string,
    specificRoles: string
) {
    const response = await axios.post(
        `${apiUrl}/auth/register`,
        new URLSearchParams({
            fullname: fullName.trim(),
            username: username.trim(),
            email: email.trim(),
            password: password,
            role: 'admin',
            specific_role: specificRoles.toLowerCase().trim()
        }),
        {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
    );
    return response;
}

export async function CreateFamilyNames(familyName: string) {
    const access_token = localStorage.getItem('access_token');
    
    if (!access_token) {
        throw new Error('No access token found');
    }

    const response = await axios.post(
        `${API_URL}/family/create`,
        `name=${familyName}`,
        {
            headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            withCredentials: true
        }
    );

    return response;
}

export async function CreateCategories(category: string) {
    const access_token = localStorage.getItem("access_token")
    if (!access_token) {
        throw new Error('No access token found');
    }

    const response = await axios.post(
        `${API_URL}/expense-categories`,
        `name=${category}`,
        {
            headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            },
        }
    );

    return response
}

export async function AdminRegisterUser(
    username: string, 
    email: string, 
    password: string,
    fullName: string,
    specificRoles: string,
    role: string
) {
    const access_token = localStorage.getItem("access_token")
    const response = await axios.post(
        `${apiUrl}/users/add_members`,
        new URLSearchParams({
            fullname: fullName.trim(),
            username: username.trim(),
            email: email.trim(),
            password: password,
            role: role,
            specific_role: specificRoles.toLowerCase().trim(),
        }),
        {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
    );
    return response;
}

export async function Logout() {
    localStorage.removeItem("access_token")
    localStorage.removeItem("family_id")
    localStorage.removeItem("user_id")
}

export async function GetFamilyData() {
    const access_token = localStorage.getItem("access_token")
    const response = await axios.get(`
    ${apiUrl}/expenses/family-data`,
    {
        headers: {
            'Authorization': `Bearer ${access_token}`,
        }
    })
    return response
}

export async function getMemberFamily() {
    const access_token = localStorage.getItem("access_token")
    const response = await axios.get(`
    ${apiUrl}/users/family`,
    {
        headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${access_token}`,
        }
    })
    return response
}

export async function getMemberData () {
    const access_token = localStorage.getItem("access_token")
    const response = await axios.get(`
    ${apiUrl}/expenses/member-data`,
    {
        headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${access_token}`,
        }
    })
    return response
}

export async function getBudgets () {
    const access_token = localStorage.getItem("access_token")
    const response = await axios.get(`
    ${apiUrl}/budgets`,
    {
        headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${access_token}`,
        }
    })
    return response
}
export async function getExpenses () {
    const access_token = localStorage.getItem("access_token")
    const response = await axios.get(`
    ${apiUrl}/expenses`,
    {
        headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${access_token}`,
        }
    })
    return response
}

export async function createNewExpenses(categoryId: string, amount: number, date_str: string, description: string) {
    const access_token = localStorage.getItem("access_token");
    const newAmount = amount.toString()
    const response = await axios.post(
      `${API_URL}/expenses/`,
      new URLSearchParams({
        category_id: categoryId,
        amount: newAmount,
        date_str: date_str,
        description: description,
      }).toString(),
      {
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return response
  }

  export async function getCategories () {
    const access_token = localStorage.getItem("access_token");
    const response = await axios.get(`
    ${apiUrl}/expense-categories/`,
    {
        headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${access_token}`,
        }
    })
    return response
  }

  export async function updateExpense(expenseId: string, categoryId: string, amount: number, date_str: string, description: string) {
    const access_token = localStorage.getItem("access_token");
    const newAmount = amount.toString()
    const response = await axios.put(
      `${API_URL}/expenses/${expenseId}`,
      new URLSearchParams({
        category_id: categoryId,
        amount: newAmount,
        date_str: date_str.toString().split('T')[0],
        description: description,
      }).toString(),
      {
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return response
  }

export async function updateCategoy (categoryId: string, name: string) {
    const access_token = localStorage.getItem("access_token");
    const response = await axios.put(
        `${API_URL}/expense-categories/${categoryId}`, 
        new URLSearchParams({
            name: name
          }),
          {
            headers: {
              'accept': 'application/json',
              'Authorization': `Bearer ${access_token}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
    )
    return response
}

export async function adminAddBudget(categoryId: string, amount: string, period: string, userId: string) {
    const access_token = localStorage.getItem("access_token");
    const [year, month] = period.split("-");
    const data = new URLSearchParams({
        category_id: categoryId,
        amount: amount,
        month: month,
        year: year,
        user_id: userId,
    });
    const response = await axios.post(
        `${API_URL}/budgets/`,
        data.toString(),
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Bearer ${access_token}`,
                'accept': 'application/json',
            },
        }
    );
    return response;
}

export async function deleteExpense(expenseId: string)  {
    const access_token = localStorage.getItem("access_token");
    const response = await axios.delete(`
    ${API_URL}/expenses/${expenseId}`,
    {
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    )

    return response
}

export async function UpdateBudget(
    budgetId: string,
    userId: string,
    categoryId: string,
    amount: string,
    month: string,
    year: string
  ) {
      const access_token = localStorage.getItem("access_token");
    const [_, months] = month.split("-");
    const response = await axios.put(
        `${API_URL}/budgets/${budgetId}`,
        new URLSearchParams({
          user_id: userId,
          category_id: categoryId,
          amount: amount,
          month: months,
          year: year,
        }).toString(),
        {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
  
    return response;
  }
  
export async function deleteBudget(budgetId: string)  {
    const access_token = localStorage.getItem("access_token");
    const response = await axios.delete(`
    ${API_URL}/budgets/${budgetId}`,
    {
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    )

    return response
}

export async function RequestBudget(categoryId: string, period:string, amount:string) {
    const access_token = localStorage.getItem("access_token");
    const userId = localStorage.getItem("user_id");
    if (!access_token || !userId) {
        throw new Error("Missing access token or user ID");
    }
    const [year, month] = period.split("-");
    const data = new URLSearchParams({
        category_id: categoryId,
        requested_amount: amount,
        month: month,
        user_id: userId,
        year: year,
    });
    const response = await axios.post(
        `${API_URL}/budget-requests/`,
        data.toString(),
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Bearer ${access_token}`,
                'accept': 'application/json',
            },
        }
    );
    return response;
}

export async function GetMonthlyData () {
    const access_token = localStorage.getItem("access_token");
    const response = await axios.get(`
    ${apiUrl}/expenses/monthly-data`,
    {
        headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${access_token}`,
        }
    })
    return response
}

export async function ChangePassword(currentPassword: string, newPassword: string) {
    const access_token = localStorage.getItem("access_token");
    const response = await axios.put(
        `${API_URL}/auth/change-password`,
        new URLSearchParams({
            current_password: currentPassword,
            new_password: newPassword,
        }),
        {
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }
    );
    return response
}

export async function BugetPending () {
    const access_token = localStorage.getItem("access_token");
    const response = await axios.get(`
        ${API_URL}/budget-requests/pending
    `, {
        headers: {
            'Authorization': `Bearer ${access_token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    })

    return response
}

export async function ApproveBudget (requestId: string) {
    const access_token = localStorage.getItem("access_token");
    const response = await axios.put(`
        ${API_URL}/budget-requests/approve/${requestId}
    `, {},{
        headers: {
            'Authorization': `Bearer ${access_token}`,
            'Accept': 'application/json',
        },
    })

    return response
}

export async function RejectBudget (requestId: string) {
    const access_token = localStorage.getItem("access_token");
    const response = await axios.put(`
        ${API_URL}/budget-requests/deny/${requestId}
    `, {},{
        headers: {
            'Authorization': `Bearer ${access_token}`,
            'Accept': 'application/json',
        },
    })

    return response
}

export async function ForgotPassword(email: string) {
    const data = new URLSearchParams();
    data.append('email', email);
    const response = await axios.post(
        `${API_URL}/auth/forget-password`,
        data.toString(), 
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
            },
        }
    );
    return response
}
