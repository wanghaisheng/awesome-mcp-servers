"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { twoFactor } from "~/lib/auth-client";

export function TwoFactorPageClient() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [trustDevice, setTrustDevice] = useState(true);
  const [isUsingBackupCode, setIsUsingBackupCode] = useState(false);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Call the appropriate verification method based on whether using TOTP or backup code
    try {
      const verifyPromise = isUsingBackupCode
        ? twoFactor.verifyBackupCode({
            code,
          })
        : twoFactor.verifyTotp({
            code,
          });

      // Handle the promise with then/catch
      verifyPromise
        .then(() => {
          router.push("/dashboard");
        })
        .catch((err: unknown) => {
          setError(
            `Invalid ${isUsingBackupCode ? "backup" : "verification"} code. Please try again.`,
          );
          console.error(err);
          setLoading(false);
        })
        .finally(() => {
          if (loading) setLoading(false);
        });
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
      setLoading(false);
    }
  };

  const toggleVerificationMethod = () => {
    setIsUsingBackupCode(!isUsingBackupCode);
    setCode("");
    setError("");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg border p-6 shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Two-Factor Authentication</h1>
          <p className="mt-2 text-gray-600">
            {isUsingBackupCode
              ? "Enter a backup code"
              : "Enter your authentication code"}
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleVerify} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="code" className="block text-sm font-medium">
                {isUsingBackupCode ? "Backup Code" : "Verification Code"}
              </label>
              <input
                id="code"
                name="code"
                type="text"
                required
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                }}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder={
                  isUsingBackupCode ? "Enter backup code" : "6-digit code"
                }
                maxLength={isUsingBackupCode ? undefined : 6}
                pattern={isUsingBackupCode ? undefined : "[0-9]{6}"}
              />
              <p className="mt-1 text-sm text-gray-500">
                {isUsingBackupCode
                  ? "Enter one of your backup codes"
                  : "Enter the 6-digit code from your authenticator app"}
              </p>
            </div>

            {!isUsingBackupCode && (
              <div className="flex items-start">
                <div className="flex h-5 items-center">
                  <input
                    id="trustDevice"
                    name="trustDevice"
                    type="checkbox"
                    checked={trustDevice}
                    onChange={(e) => {
                      setTrustDevice(e.target.checked);
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor="trustDevice"
                    className="font-medium text-gray-700"
                  >
                    Trust this device
                  </label>
                  <p className="text-gray-500">
                    You won't need to enter a verification code on this device
                    for 30 days
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify"}
            </button>

            <button
              type="button"
              onClick={toggleVerificationMethod}
              className="flex w-full justify-center rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              {isUsingBackupCode
                ? "Use authenticator app instead"
                : "Use a backup code instead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
