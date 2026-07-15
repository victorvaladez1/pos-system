import { Request, Response } from "express";
import { validate as isUuid } from "uuid";
import type {
    CreateUserRequest,
    UpdateUserRequest
} from "../types/user.types.js";
import {
    isUserRole,
    toPublicUser
} from "../types/user.types.js";
import {
    createUserRow,
    getUserRows,
    updateUserRowById,
    deactivateUserRowById
} from "../services/users.service.js";

export const createUser = async (req: Request, res: Response) => {
    const {
        first_name,
        middle_name,
        last_name,
        user_role,
        passcode_hash,
        is_active
    } = req.body ?? {};

    if (
        first_name === undefined ||
        typeof first_name !== "string" ||
        Array.isArray(first_name) ||
        first_name.trim() === ""
    ) {
        return res.status(400).json({ error: "First name must be a non-empty string." });
    }

    if (
        middle_name !== undefined &&
        middle_name !== null &&
        (
            typeof middle_name !== "string" ||
            Array.isArray(middle_name) ||
            middle_name.trim() === ""
        )
    ) {
        return res.status(400).json({ error: "Middle name must be a non-empty string or null." });
    }

    if (
        last_name === undefined ||
        typeof last_name !== "string" ||
        Array.isArray(last_name) ||
        last_name.trim() === ""
    ) {
        return res.status(400).json({ error: "Last name must be a non-empty string." });
    }

    if (
        user_role === undefined ||
        typeof user_role !== "string" ||
        !isUserRole(user_role)
    ) {
        return res.status(400).json({ error: "User role must be valid." });
    }

    if (
        passcode_hash === undefined ||
        typeof passcode_hash !== "string" ||
        Array.isArray(passcode_hash) ||
        passcode_hash.trim() === ""
    ) {
        return res.status(400).json({ error: "Passcode hash must be a non-empty string." });
    }

    if (is_active !== undefined && typeof is_active !== "boolean") {
        return res.status(400).json({ error: "Is active must be a boolean." });
    }

    const fields: CreateUserRequest = {
        first_name: first_name.trim(),
        middle_name: middle_name === undefined || middle_name === null ? null : middle_name.trim(),
        last_name: last_name.trim(),
        user_role,
        passcode_hash: passcode_hash.trim()
    };

    if (is_active !== undefined) {
        fields.is_active = is_active;
    }

    try {
        const user = await createUserRow(fields);
        return res.status(201).json({ user: toPublicUser(user) });
    } catch (error) {
        console.error("Failed to create user.", error);
        return res.status(500).json({ error: "Failed to create user." });
    }
};

export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await getUserRows();
        return res.status(200).json({
            users: users.map(toPublicUser)
        });
    } catch (error) {
        console.error("Failed to retrieve users.", error);
        return res.status(500).json({ error: "Failed to retrieve users." });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    const { id } = req.params;

    const {
        first_name,
        middle_name,
        last_name,
        user_role,
        passcode_hash,
        is_active
    } = req.body ?? {};

    if (!id || typeof id !== "string" || !isUuid(id) || Array.isArray(id)) {
        return res.status(400).json({ error: "User id must be a valid UUID." });
    }

    if (
        first_name !== undefined &&
        (
            typeof first_name !== "string" ||
            Array.isArray(first_name) ||
            first_name.trim() === ""
        )
    ) {
        return res.status(400).json({ error: "First name must be a non-empty string." });
    }

    if (
        middle_name !== undefined &&
        middle_name !== null &&
        (
            typeof middle_name !== "string" ||
            Array.isArray(middle_name) ||
            middle_name.trim() === ""
        )
    ) {
        return res.status(400).json({ error: "Middle name must be a non-empty string or null." });
    }

    if (
        last_name !== undefined &&
        (
            typeof last_name !== "string" ||
            Array.isArray(last_name) ||
            last_name.trim() === ""
        )
    ) {
        return res.status(400).json({ error: "Last name must be a non-empty string." });
    }

    if (
        user_role !== undefined &&
        (typeof user_role !== "string" || !isUserRole(user_role))
    ) {
        return res.status(400).json({ error: "User role must be valid." });
    }

    if (
        passcode_hash !== undefined &&
        (
            typeof passcode_hash !== "string" ||
            Array.isArray(passcode_hash) ||
            passcode_hash.trim() === ""
        )
    ) {
        return res.status(400).json({ error: "Passcode hash must be a non-empty string." });
    }

    if (is_active !== undefined && typeof is_active !== "boolean") {
        return res.status(400).json({ error: "Is active must be a boolean." });
    }

    const fieldsToUpdate: UpdateUserRequest = {};

    if (first_name !== undefined) {
        fieldsToUpdate.first_name = first_name.trim();
    }

    if (middle_name !== undefined) {
        fieldsToUpdate.middle_name = middle_name === null ? null : middle_name.trim();
    }

    if (last_name !== undefined) {
        fieldsToUpdate.last_name = last_name.trim();
    }

    if (user_role !== undefined) {
        fieldsToUpdate.user_role = user_role;
    }

    if (passcode_hash !== undefined) {
        fieldsToUpdate.passcode_hash = passcode_hash.trim();
    }

    if (is_active !== undefined) {
        fieldsToUpdate.is_active = is_active;
    }

    if (Object.keys(fieldsToUpdate).length === 0) {
        return res.status(400).json({ error: "No valid fields provided to update." });
    }

    try {
        const user = await updateUserRowById(id, fieldsToUpdate);

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        return res.status(200).json({ user: toPublicUser(user) });
    } catch (error) {
        console.error("Failed to update user.", error);
        return res.status(500).json({ error: "Failed to update user." });
    }
};

export const deactivateUser = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id || typeof id !== "string" || !isUuid(id) || Array.isArray(id)) {
        return res.status(400).json({ error: "User id must be a valid UUID." });
    }

    try {
        const user = await deactivateUserRowById(id);

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        return res.status(200).json({ user: toPublicUser(user) });
    } catch (error) {
        console.error("Failed to deactivate user.", error);
        return res.status(500).json({ error: "Failed to deactivate user." });
    }
};