'use client'

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AcceptFamilyInvite } from "@/service/API";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function AcceptInvite() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Đang xác thực lời mời tham gia...');

    useEffect(() => {
        const handleAccept = async () => {
            if (!token) {
                setStatus('error');
                setMessage('Mã xác thực không tồn tại hoặc đã bị hỏng.');
                return;
            }

            try {
                // Gọi API để chấp nhận lời mời
                await AcceptFamilyInvite(token);
                setStatus('success');
                setMessage('Chúc mừng! Bạn đã trở thành thành viên của gia đình.');
                
                toast({ 
                    title: "Thành công", 
                    description: "Bạn đã tham gia gia đình mới!" 
                });

                // Tự động chuyển hướng sau 2 giây nếu thành công
                setTimeout(() => {
                    navigate('/');
                }, 2000);

            } catch (error: any) {
                setStatus('error');
                // Ưu tiên hiển thị lỗi từ Server trả về, nếu không có thì dùng lỗi mặc định
                const errorMsg = error.response?.data?.detail || 'Mã mời đã hết hạn hoặc không còn hiệu lực.';
                setMessage(errorMsg);
                
                toast({ 
                    variant: "destructive",
                    title: "Lỗi gia nhập", 
                    description: errorMsg 
                });
            }
        };

        handleAccept();
    }, [token, navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
            <Card className="w-full max-w-md text-center shadow-lg border-t-4 border-t-blue-500">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        {status === 'loading' && (
                            <Loader2 className="h-14 w-14 animate-spin text-blue-500" />
                        )}
                        {status === 'success' && (
                            <CheckCircle2 className="h-14 w-14 text-green-500" />
                        )}
                        {status === 'error' && (
                            <XCircle className="h-14 w-14 text-red-500" />
                        )}
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-800">
                        Xác nhận lời mời
                    </CardTitle>
                    <CardDescription className="text-base pt-2">
                        {message}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button 
                        onClick={() => navigate(status === 'success' ? '/' : '/login')} 
                        className={`w-full py-6 text-lg transition-all ${
                            status === 'success' 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : 'bg-gray-800 hover:bg-gray-900'
                        }`}
                        disabled={status === 'loading'}
                    >
                        {status === 'loading' && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                        {status === 'success' ? 'Đi đến Trang chủ' : 'Quay lại Đăng nhập'}
                    </Button>
                    
                    {status === 'success' && (
                        <p className="text-sm text-gray-500 mt-4 animate-pulse">
                            Hệ thống sẽ tự động chuyển hướng sau giây lát...
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}