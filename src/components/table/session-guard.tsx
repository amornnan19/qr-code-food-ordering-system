"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SessionGuardProps {
  tableId: string;
  children: React.ReactNode;
}

interface SessionValidation {
  valid: boolean;
  reason: string;
  hasActiveSession: boolean;
}

export function SessionGuard({ tableId, children }: SessionGuardProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session");
  
  const [validationState, setValidationState] = useState<{
    loading: boolean;
    validation: SessionValidation | null;
  }>({
    loading: true,
    validation: null,
  });

  const validateSession = async () => {
    setValidationState({ loading: true, validation: null });
    
    try {
      const params = new URLSearchParams();
      if (sessionId) params.append("sessionId", sessionId);
      
      const response = await fetch(
        `/api/tables/${tableId}/validate-session?${params}`
      );
      
      if (response.ok) {
        const validation = await response.json();
        setValidationState({ loading: false, validation });
      } else {
        setValidationState({
          loading: false,
          validation: {
            valid: false,
            reason: "Session validation failed",
            hasActiveSession: false,
          },
        });
      }
    } catch (error) {
      console.error("Session validation error:", error);
      setValidationState({
        loading: false,
        validation: {
          valid: false,
          reason: "Network error",
          hasActiveSession: false,
        },
      });
    }
  };

  useEffect(() => {
    validateSession();
  }, [tableId, sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  const { loading, validation } = validationState;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Validating session...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Session validation failed
  if (!validation?.valid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            
            <h1 className="text-xl font-bold text-gray-900">
              Session Expired
            </h1>
            
            <p className="text-muted-foreground">
              {validation?.reason || "Your session has expired or is invalid."}
            </p>

            {validation?.hasActiveSession ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>This table has a new active session</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Please scan the latest QR code from the table to continue ordering.
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Please ask restaurant staff to generate a new QR code for this table.
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button
                variant="outline"
                onClick={validateSession}
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
              <Button
                onClick={() => router.push("/")}
                className="flex-1"
              >
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Session is valid, render children
  return <>{children}</>;
}