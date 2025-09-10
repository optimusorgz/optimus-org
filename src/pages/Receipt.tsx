import React, { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Label } from "@/components/ui/label";

const Receipt = () => {
  const [searchParams] = useSearchParams();
  const receiptRef = useRef<HTMLDivElement>(null);

  const name = searchParams.get("name") || "N/A";
  const email = searchParams.get("email") || "N/A";
  const phone = searchParams.get("phone") || "N/A";
  const amount = searchParams.get("amount") || "N/A";
  const orderId = searchParams.get("orderId") || "N/A";
  const paymentId = searchParams.get("paymentId") || "N/A";
  const dateParam = searchParams.get("date");
  const date = dateParam ? new Date(dateParam).toLocaleString() : "N/A";

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (receiptRef.current) {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2, // Increase scale for better resolution
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`receipt_${orderId}.pdf`);
    }
  };

  useEffect(() => {
    // Optional: You could trigger print automatically or any other action here
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <Card ref={receiptRef} className="w-full max-w-2xl shadow-lg print:shadow-none">
        <CardHeader className="bg-primary text-primary-foreground text-center py-6 rounded-t-lg">
          <CardTitle className="text-3xl font-bold">Event Registration Receipt</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4 text-gray-800 dark:text-gray-200">
          <p className="text-lg">Thank you for your registration! Here are your payment details:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-base">
            <div className="space-y-1">
              <Label className="font-semibold">Name:</Label>
              <p>{name}</p>
            </div>
            <div className="space-y-1">
              <Label className="font-semibold">Email:</Label>
              <p>{email}</p>
            </div>
            <div className="space-y-1">
              <Label className="font-semibold">Phone:</Label>
              <p>{phone}</p>
            </div>
            <div className="space-y-1">
              <Label className="font-semibold">Amount:</Label>
              <p>₹{amount}</p>
            </div>
            <div className="space-y-1">
              <Label className="font-semibold">Order ID:</Label>
              <p>{orderId}</p>
            </div>
            <div className="space-y-1">
              <Label className="font-semibold">Payment ID:</Label>
              <p>{paymentId}</p>
            </div>
            <div className="space-y-1">
              <Label className="font-semibold">Date:</Label>
              <p>{date}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col md:flex-row justify-between items-center gap-4 p-6 bg-gray-50 dark:bg-gray-800 rounded-b-lg">
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Thank you for registering!</p>
          <div className="flex gap-2">
            <Button onClick={handlePrint} className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect width="12" height="8" x="6" y="14"></rect></svg>
              Print / Save as PDF
            </Button>
            <Button onClick={handleDownloadPdf} className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" x2="12" y1="15" y2="3"></line></svg>
              Download Receipt
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Receipt;
