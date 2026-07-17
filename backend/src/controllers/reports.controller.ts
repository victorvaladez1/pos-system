import type { Request, Response } from "express";
import { getDailySalesReport, getPaymentMethodReports } from "../services/reports.service.js";

export const getDailySales = async (_req: Request, res: Response) => {
    try {
        const report = await getDailySalesReport();

        return res.status(200).json({ report });
    } catch (error) {
        console.error("Failed to retrieve daily sales report.", error);
        return res.status(500).json({
            error: "Failed to retrieve daily sales report."
        });
    }
};

export const getPaymentMethods = async (_req: Request, res: Response) => {
    try {
        const report = await getPaymentMethodReports();

        return res.status(200).json({ report });
    } catch (error) {
        console.error("Failed to retrieve payment methods report.", error);
        return res.status(500).json({
            error: "Failed to retrieve payment methods report."
        });
    }
};