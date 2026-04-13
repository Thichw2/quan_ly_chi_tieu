'use client'

import { useEffect, useState } from "react";
import { redirect, useNavigate, useSearchParams } from "react-router-dom"; // Sửa ở đây
import { acceptInviteApi } from "@/service/API";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function AcceptInvite() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Đang xác thực lời mời...');

    useEffect(() => {
        const handleAccept = async () => {
            if (!token) {
                setStatus('error');
                setMessage('Mã xác thực không tồn tại.');
                return;
            }

            try {
                await acceptInviteApi(token);
                setStatus('success');
                setMessage('Chúc mừng! Bạn đã tham gia gia đình thành công.');
                toast({ title: "Thành công", description: "Đã gia nhập gia đình!" });
                redirect('/'); // Chuyển hướng sau khi thành công
            } catch (error: any) {
                setStatus('error');
                setMessage(error.response?.data?.detail || 'Mã mời đã hết hạn hoặc không hợp lệ.');
            }
        };

        handleAccept();
    }, [token]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        {status === 'loading' && <Loader2 className="h-12 w-12 animate-spin text-blue-500" />}
                        {status === 'success' && <CheckCircle2 className="h-12 w-12 text-green-500" />}
                        {status === 'error' && <XCircle className="h-12 w-12 text-red-500" />}
                    </div>
                    <CardTitle>Tham gia gia đình</CardTitle>
                    <CardDescription>{message}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button 
                        onClick={() => navigate(status === 'success' ? '/dashboard' : '/login')} 
                        className="w-full"
                    >
                        {status === 'success' ? 'Đi đến Bảng điều khiển' : 'Quay lại đăng nhập'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}