import axios from 'axios'
import apiUrl from './apiUrl'

// Small delay helper for mocks
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper để lấy token
const getAuthHeader = () => {
  const token = localStorage.getItem("access_token");
  return {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json'
  };
};

// --- AUTH / USERS ---
export async function Login(username: string, password: string) {
  const params = new URLSearchParams();
  params.append('username', username);
  params.append('password', password);

  return await axios.post(`${apiUrl}/auth/login`, params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' }
  });
}

export async function RegisterUser(username: string, email: string, password: string, fullName: string, role: string, specificRoles: string) {
   const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('fullname', fullName);
    formData.append('role', role); // admin hoặc member
    formData.append('specific_role', specificRoles); // father, mother...

    // Thay thế endpoint và axios instance của bạn ở đây
    return await axios.post(`${apiUrl}/auth/register`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
}

export async function VerifyEmail(email: string, otp: string) {
  const params = new URLSearchParams();
  params.append('email', email);
  params.append('otp', otp);
  return await axios.post(`${apiUrl}/auth/verify-email`, params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' }
  });
}

export async function ChangePassword(currentPassword: string, newPassword: string) {
  return await axios.put(`${apiUrl}/auth/change-password`, new URLSearchParams({ current_password: currentPassword, new_password: newPassword }), {
    headers: { ...getAuthHeader(), 'Content-Type': 'application/x-www-form-urlencoded' }
  });
}

export async function ForgotPassword(email: string) {
  const data = new URLSearchParams();
  data.append('email', email);
  return await axios.post(`${apiUrl}/auth/forget-password`, data.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' }
  });
}

export async function Logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("family_id");
  localStorage.removeItem("user_id");
}

export async function AdminRegisterUser(username: string, email: string, password: string, fullName: string, specificRole: string, role: string) {
  const params = new URLSearchParams();
  params.append('fullname', fullName);
  params.append('username', username);
  params.append('email', email);
  params.append('password', password);
  params.append('role', role);
  params.append('specific_role', specificRole);
  return await axios.post(`${apiUrl}/users/add_members`, params, { headers: { ...getAuthHeader(), 'Content-Type': 'application/x-www-form-urlencoded' } });
}

export async function deleteMemberApi(userId: string) {
  return await axios.delete(`${apiUrl}/users/${userId}`, { headers: getAuthHeader() });
}

export async function CreateCategories(categoryName: string) {
  const params = new URLSearchParams();
  params.append('name', categoryName);
  return await axios.post(`${apiUrl}/expense-categories/`, params, { headers: { ...getAuthHeader(), 'Content-Type': 'application/x-www-form-urlencoded' } });
}
export async function updateCategoryApi(id: string, newName: string) {
  const params = new URLSearchParams();
  params.append('name', newName);
  return await axios.put(`${apiUrl}/expense-categories/${id}`, params, { headers: { ...getAuthHeader(), 'Content-Type': 'application/x-www-form-urlencoded' } });
}
export async function deleteCategoryApi(id: string) {
  return await axios.delete(`${apiUrl}/expense-categories/${id}`, { headers: getAuthHeader() });
}

export async function getMemberFamily() {
  return await axios.get(`${apiUrl}/users/family`, { headers: getAuthHeader() });
}

// --- FAMILY ---
export async function CreateFamilyNames(familyName: string) {
  return await axios.post(`${apiUrl}/family/create`, new URLSearchParams({ name: familyName }), { headers: { ...getAuthHeader(), 'Content-Type': 'application/x-www-form-urlencoded' } });
}
export async function ActivateAccount(token: string) {
  return await axios.get(`${apiUrl}/auth/activate?token=${token}`, { headers: { 'Accept': 'application/json' } });
}
export async function updateMemberApi(userId: string, updateData: { fullname?: string, role?: string, specific_role?: string }) {
  const params = new URLSearchParams();
  if (updateData.fullname) params.append('fullname', updateData.fullname);
  if (updateData.role) params.append('role', updateData.role);
  if (updateData.specific_role) params.append('specific_role', updateData.specific_role);
  return await axios.put(`${apiUrl}/users/${userId}`, params, { headers: { ...getAuthHeader(), 'Content-Type': 'application/x-www-form-urlencoded' } });
}
export async function GetMe() { return await axios.get(`${apiUrl}/auth/me`, { headers: getAuthHeader() }); }
export async function GetFamilyDetail() { return await axios.get(`${apiUrl}/family/detail`, { headers: getAuthHeader() }); }
export async function LeaveFamily() { return await axios.post(`${apiUrl}/family/leave`, {}, { headers: getAuthHeader() }); }
export async function AcceptFamilyInvite(token: string) { return await axios.post(`${apiUrl}/users/accept-invite`, new URLSearchParams({ token }), { headers: { ...getAuthHeader(), 'Content-Type': 'application/x-www-form-urlencoded' } }); }
export async function inviteMemberViaEmail(email: string, role: string) { const params = new URLSearchParams(); params.append('email', email); params.append('role', role); return await axios.post(`${apiUrl}/users/invite_only`, params, { headers: { ...getAuthHeader(), 'Content-Type': 'application/x-www-form-urlencoded' } }); }



export async function updateBudget(budgetId: string, updateData: { user_id?: string; category_id?: string; amount?: number; month?: number; year?: number }) {
  const params = new URLSearchParams();
  if (updateData.user_id) params.append('user_id', updateData.user_id);
  if (updateData.category_id) params.append('category_id', updateData.category_id);
  if (updateData.amount !== undefined) params.append('amount', String(updateData.amount));
  if (updateData.month !== undefined) params.append('month', String(updateData.month));
  if (updateData.year !== undefined) params.append('year', String(updateData.year));
  return await axios.put(`${apiUrl}/budgets/${budgetId}`, params, { headers: { ...getAuthHeader(), 'Content-Type': 'application/x-www-form-urlencoded' } });
}
// Small mock for RequestBudget (not supported by backend yet)
export async function GetFamilyData(month?: number, year?: number) { 
  let url = `${apiUrl}/expenses/family-data`;
  const params = new URLSearchParams();
  if (month) params.append('month', month.toString());
  if (year) params.append('year', year.toString());
  if (params.toString()) url += `?${params.toString()}`;
  return await axios.get(url, { headers: getAuthHeader() }); 
}
// Ví dụ trong file service/API.ts


export async function getMemberData (month?: number, year?: number) {
    const access_token = localStorage.getItem("access_token")
    let url = `${apiUrl}/expenses/member-data`;
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    if (params.toString()) url += `?${params.toString()}`;
    const response = await axios.get(url,
    {
        headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${access_token}`,
        }
    })
    return response
}

export async function getBudgets (month?: number, year?: number) {
    const access_token = localStorage.getItem("access_token")
    let url = `${apiUrl}/budgets`;
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    if (params.toString()) url += `?${params.toString()}`;
    const response = await axios.get(url,
    {
        headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${access_token}`,
        }
    })
    return response
}
export async function getExpenses (month?: number, year?: number) {
    const access_token = localStorage.getItem("access_token")
    let url = `${apiUrl}/expenses`;
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    if (params.toString()) url += `?${params.toString()}`;
    const response = await axios.get(url,
    {
        headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${access_token}`,
        }
    })
    return response
}

export async function checkBudget(categoryId: string, amount: number, dateStr: string, targetUserId?: string) {
  const params: Record<string, string> = {
    category_id: categoryId,
    amount: amount.toString(),
    date_str: dateStr,
  };
  if (targetUserId) params.target_user_id = targetUserId;

  const response = await axios.get(`${apiUrl}/expenses/check-budget`, {
    params,
    headers: getAuthHeader(),
  });
  return response;
}

export async function createNewExpenses(categoryId: string, amount: number, date_str: string, description: string, targetUserId?: string) {
    const access_token = localStorage.getItem("access_token");
    const newAmount = amount.toString()
    const params: Record<string, string> = {
      category_id: categoryId,
      amount: newAmount,
      date_str: date_str,
      description: description,
    };
    if (targetUserId) params.target_user_id = targetUserId;
    const response = await axios.post(
      `${apiUrl}/expenses/`,
      new URLSearchParams(params).toString(),
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
      `${apiUrl}/expenses/${expenseId}`,
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
        `${apiUrl}/expense-categories/${categoryId}`, 
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
        `${apiUrl}/budgets/`,
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
    ${apiUrl}/expenses/${expenseId}`,
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
        `${apiUrl}/budgets/${budgetId}`,
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
    ${apiUrl}/budgets/${budgetId}`,
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
        `${apiUrl}/budget-requests/`,
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

export async function GetMonthlyData (year?: number) {
    const access_token = localStorage.getItem("access_token");
    let url = `${apiUrl}/expenses/monthly-data`;
    if (year) url += `?year=${year}`;
    const response = await axios.get(url,
    {
        headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${access_token}`,
        }
    })
    return response
}



export async function BugetPending () {
    const access_token = localStorage.getItem("access_token");
    const response = await axios.get(`
        ${apiUrl}/budget-requests/pending
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
        ${apiUrl}/budget-requests/approve/${requestId}
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
        ${apiUrl}/budget-requests/deny/${requestId}
    `, {},{
        headers: {
            'Authorization': `Bearer ${access_token}`,
            'Accept': 'application/json',
        },
    })

    return response
}

// export async function ForgotPassword(email: string) {
//     const data = new URLSearchParams();
//     data.append('email', email);
//     const response = await axios.post(
//         `${apiUrl}/auth/forget-password`,
//         data.toString(), 
//         {
//             headers: {
//                 'Content-Type': 'application/x-www-form-urlencoded',
//                 'Accept': 'application/json',
//             },
//         }
//     );
//     return response
// }
// export async function ChangePassword(currentPassword: string, newPassword: string) {
//     const access_token = localStorage.getItem("access_token");
//     const response = await axios.put(
//         `${apiUrl}/auth/change-password`,
//         new URLSearchParams({
//             current_password: currentPassword,
//             new_password: newPassword,
//         }),
//         {
//             headers: {
//                 'Authorization': `Bearer ${access_token}`,
//                 'Accept': 'application/json',
//                 'Content-Type': 'application/x-www-form-urlencoded',
//             },
//         }
//     );
//     return response
// }

// --- NOTIFICATIONS ---
export async function getNotifications() {
    return await axios.get(`${apiUrl}/notifications/`, { headers: getAuthHeader() });
}

export async function getUnreadNotificationCount() {
    return await axios.get(`${apiUrl}/notifications/unread-count`, { headers: getAuthHeader() });
}

export async function markNotificationRead(notificationId: string) {
    return await axios.put(`${apiUrl}/notifications/${notificationId}/read`, {}, { headers: getAuthHeader() });
}

export async function markAllNotificationsRead() {
    return await axios.put(`${apiUrl}/notifications/read-all`, {}, { headers: getAuthHeader() });
}

export async function deleteNotificationApi(notificationId: string) {
    return await axios.delete(`${apiUrl}/notifications/${notificationId}`, { headers: getAuthHeader() });
}