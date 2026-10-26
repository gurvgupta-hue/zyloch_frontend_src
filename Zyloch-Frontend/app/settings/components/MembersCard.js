"use client";

import React, { useCallback, useEffect, useState, useMemo } from "react";
import {
  UserPlus,
  UserX,
  UserCheck,
  Users,
  Copy,
  Check,
  Clock,
  X,
  Trash2,
  Search,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  deactivateMember,
  deleteMember,
  inviteMember,
  listMembers,
  reactivateMember,
  revokeInvite,
} from "@/lib/api/organization";
import { useTenant } from "@/context/TenantContext";
import { copyToClipboard } from "@/lib/clipboard";
import Modal from "@/components/common/Modal";

export function MembersCard({ isAdmin: isAdminProp } = {}) {
  const { isAdmin: tenantIsAdmin, tenantId } = useTenant();
  const isAdmin = isAdminProp ?? tenantIsAdmin;
  const [members, setMembers] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [revokingId, setRevokingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const [memberToDelete, setMemberToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listMembers(false);
      setMembers(data.members || []);
      setPendingInvites(data.pendingInvites || []);
      setUsage(data.usage || null);
    } catch {
      setMembers([]);
      setPendingInvites([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tenantId) load();
  }, [tenantId, load]);

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members;
    const q = searchQuery.toLowerCase();
    return members.filter(
      (m) =>
        m.name?.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q) ||
        m.role?.toLowerCase().includes(q)
    );
  }, [members, searchQuery]);

  const openInviteModal = () => {
    setEmail("");
    setInviteUrl("");
    setCopied(false);
    setIsInviteOpen(true);
  };

  const closeInviteModal = () => {
    setIsInviteOpen(false);
  };

  const onInvite = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    try {
      const res = await inviteMember(email.trim(), true);
      setInviteUrl(res.invite?.inviteUrl || "");
      toast.success(`Invite sent to ${email.trim()}`);
      setEmail("");
      await load();
    } catch {
      /* toast from API helper */
    } finally {
      setBusy(false);
    }
  };

  const copyInviteLink = async () => {
    if (!inviteUrl) return;
    const ok = await copyToClipboard(inviteUrl);
    if (ok) {
      setCopied(true);
      toast.success("Invite link copied");
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error("Failed to copy invite link");
    }
  };

  const onDeactivate = async (id) => {
    setBusy(true);
    try {
      await deactivateMember(id, true);
      await load();
    } finally {
      setBusy(false);
    }
  };

  const onReactivate = async (id) => {
    setBusy(true);
    try {
      await reactivateMember(id, true);
      await load();
    } finally {
      setBusy(false);
    }
  };

  const openDeleteConfirm = (member) => setMemberToDelete(member);
  const closeDeleteConfirm = () => {
    if (deleting) return;
    setMemberToDelete(null);
  };

  const onConfirmDelete = async () => {
    if (!memberToDelete) return;
    setDeleting(true);
    try {
      await deleteMember(memberToDelete.id, true);
      setMemberToDelete(null);
      await load();
    } finally {
      setDeleting(false);
    }
  };

  const onRevokeInvite = async (id) => {
    setRevokingId(id);
    try {
      await revokeInvite(id, true);
      await load();
    } finally {
      setRevokingId(null);
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-5">
      {/* Card Header */}
      <div className="flex items-start gap-3.5">
        <span
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: "rgba(var(--color-primary-rgb), 0.12)",
            border: "1px solid rgba(var(--color-primary-rgb), 0.28)",
            color: "var(--color-primary)",
          }}
        >
          <Users size={18} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <h2
                className="text-base sm:text-lg font-bold tracking-tight"
                style={{ color: "var(--text)" }}
              >
                Team Members
              </h2>
              {usage?.users && (
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-md"
                  style={{
                    background: "var(--elevated-surface)",
                    color: "var(--muted)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {usage.users.current}/{usage.users.max} seats
                </span>
              )}
            </div>
          </div>
          <p className="text-xs sm:text-sm mt-0.5" style={{ color: "var(--muted)" }}>
            Manage team access, roles, and pending invitations
          </p>
        </div>
      </div>
          {/* Search & Actions Row */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2"
            style={{ color: "var(--muted)" }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search members..."
            className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl transition-colors focus:outline-none"
            style={{
              background: "var(--elevated-surface)",
              border: "1px solid var(--border)",
              color: "var(--text)",
            }}
          />
        </div>

        <div className="flex items-center gap-2.5">
          <span
            className="text-xs px-3 py-1.5 rounded-lg font-medium"
            style={{
              background: "var(--elevated-surface)",
              border: "1px solid var(--border)",
              color: "var(--muted)",
            }}
          >
            {filteredMembers.length} member{filteredMembers.length === 1 ? "" : "s"}
          </span>

          {isAdmin && (
            <button
              type="button"
              onClick={openInviteModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg shadow-sm transition-all"
              style={{
                background: "var(--color-primary)",
                color: "var(--text-on-primary)",
              }}
            >
              <UserPlus size={14} />
              Invite
            </button>
          )}
        </div>
      </div>

      {!isAdmin && (
        <p className="text-xs" style={{ color: "var(--muted)" }}>
          Members can view the roster; only administrators can invite, deactivate, or delete.
        </p>
      )}

      {/* Members Table */}
      {loading ? (
        <p className="text-sm py-4" style={{ color: "var(--muted)" }}>
          Loading members…
        </p>
      ) : (
        <div
          className="overflow-x-auto rounded-xl transition-colors"
          style={{
            border: "1px solid var(--border)",
            background: "var(--surface)",
          }}
        >
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr
                className="border-b text-[10px] font-mono tracking-wider"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--elevated-surface)",
                  color: "var(--muted)",
                }}
              >
                <th className="py-3 px-4 font-semibold">Name</th>
                <th className="py-3 px-4 font-semibold">Email</th>
                <th className="py-3 px-4 font-semibold">Role</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                {isAdmin && (
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td
                    colSpan={isAdmin ? 5 : 4}
                    className="py-6 px-4 text-center text-xs"
                    style={{ color: "var(--muted)" }}
                  >
                    {searchQuery
                      ? "No Members Match Your Search."
                      : "No Members Found."}
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m) => (
                  <tr
                    key={m.id}
                    className="transition-colors hover:bg-[rgba(var(--color-primary-rgb),0.04)]"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0"
                          style={{
                            background: "var(--color-primary)",
                            color: "var(--text-on-primary)",
                          }}
                        >
                          {getInitials(m.name || m.email)}
                        </div>
                        <span
                          className="font-medium"
                          style={{ color: "var(--text)" }}
                        >
                          {m.name || "—"}
                        </span>
                      </div>
                    </td>
                    <td
                      className="py-3.5 px-4 font-mono text-xs"
                      style={{ color: "var(--muted)" }}
                    >
                      {m.email}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
                        style={{
                          background:
                            m.role === "admin"
                              ? "rgba(var(--color-primary-rgb), 0.12)"
                              : "var(--elevated-surface)",
                          border: `1px solid ${
                            m.role === "admin"
                              ? "rgba(var(--color-primary-rgb), 0.25)"
                              : "var(--border)"
                          }`,
                          color:
                            m.role === "admin"
                              ? "var(--color-primary)"
                              : "var(--text)",
                        }}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{
                            background:
                              m.role === "admin"
                                ? "var(--color-primary)"
                                : "var(--muted)",
                          }}
                        />
                        {m.role || "Member"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
                        style={{
                          background: m.isActive
                            ? "rgba(var(--success-rgb), 0.12)"
                            : "rgba(var(--warning-rgb), 0.12)",
                          border: `1px solid ${
                            m.isActive
                              ? "rgba(var(--success-rgb), 0.25)"
                              : "rgba(var(--warning-rgb), 0.25)"
                          }`,
                          color: m.isActive ? "var(--success)" : "var(--warning)",
                        }}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{
                            background: m.isActive
                              ? "var(--success)"
                              : "var(--warning)",
                          }}
                        />
                        {m.isActive ? "Active" : "Deactivated"}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="py-3.5 px-4 text-right">
                        {m.role !== "admin" ? (
                          <div className="flex items-center justify-end gap-1.5">
                            {m.isActive ? (
                              <button
                                type="button"
                                title="Deactivate member"
                                aria-label="Deactivate member"
                                disabled={busy}
                                onClick={() => onDeactivate(m.id)}
                                className="p-1.5 rounded-lg transition-colors hover:bg-[var(--elevated-surface)]"
                                style={{ color: "var(--danger)" }}
                              >
                                <UserX size={14} />
                              </button>
                            ) : (
                              <button
                                type="button"
                                title="Reactivate member"
                                aria-label="Reactivate member"
                                disabled={busy}
                                onClick={() => onReactivate(m.id)}
                                className="p-1.5 rounded-lg transition-colors hover:bg-[var(--elevated-surface)]"
                                style={{ color: "var(--color-primary)" }}
                              >
                                <UserCheck size={14} />
                              </button>
                            )}
                            <button
                              type="button"
                              title="Delete member"
                              aria-label="Delete member"
                              disabled={busy}
                              onClick={() => openDeleteConfirm(m)}
                              className="p-1.5 rounded-lg transition-colors hover:bg-[var(--elevated-surface)]"
                              style={{ color: "var(--danger)" }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ) : (
                          <span
                            className="text-xs"
                            style={{ color: "var(--muted)" }}
                          >
                            —
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pending Invitations Section (Preserved) */}
      {!loading && pendingInvites.length > 0 && (
        <div className="pt-2 space-y-3">
          <div className="flex items-center gap-2">
            <Clock size={15} style={{ color: "var(--muted)" }} />
            <h3
              className="text-sm font-semibold m-0"
              style={{ color: "var(--text)" }}
            >
              Pending Invitations
            </h3>
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                background: "var(--elevated-surface)",
                color: "var(--muted)",
                border: "1px solid var(--border)",
              }}
            >
              {pendingInvites.length}
            </span>
          </div>

          <div
            className="overflow-x-auto rounded-xl transition-colors"
            style={{
              border: "1px solid var(--border)",
              background: "var(--surface)",
            }}
          >
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr
                  className="border-b text-[10px] font-mono tracking-wider"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--elevated-surface)",
                    color: "var(--muted)",
                  }}
                >
                  <th className="py-3 px-4 font-semibold">Email</th>
                  <th className="py-3 px-4 font-semibold">Invited</th>
                  <th className="py-3 px-4 font-semibold">Expires</th>
                  {isAdmin && (
                    <th className="py-3 px-4 font-semibold text-right">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
                {pendingInvites.map((invite) => (
                  <tr
                    key={invite.id}
                    className="transition-colors hover:bg-[rgba(var(--color-primary-rgb),0.04)]"
                  >
                    <td
                      className="py-3 px-4 font-mono text-xs"
                      style={{ color: "var(--text)" }}
                    >
                      {invite.email}
                    </td>
                    <td className="py-3 px-4" style={{ color: "var(--muted)" }}>
                      {invite.invitedAt
                        ? new Date(invite.invitedAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="py-3 px-4" style={{ color: "var(--muted)" }}>
                      {invite.expiresAt
                        ? new Date(invite.expiresAt).toLocaleDateString()
                        : "—"}
                    </td>
                    {isAdmin && (
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          disabled={revokingId === invite.id}
                          onClick={() => onRevokeInvite(invite.id)}
                          className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors"
                          style={{
                            color: "var(--danger)",
                            background: "rgba(var(--danger-rgb), 0.08)",
                          }}
                        >
                          <X size={12} /> Revoke
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {isInviteOpen && (
        <Modal
          isOpen={isInviteOpen}
          onClose={closeInviteModal}
          title="Invite a member"
          size="sm"
        >
          <form onSubmit={onInvite} className="flex flex-col gap-3 pt-1">
            <label
              className="text-xs font-medium"
              style={{ color: "var(--muted)" }}
            >
              Email address
            </label>
            <input
              type="email"
              required
              autoFocus
              placeholder="member@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl px-3 py-2 text-xs sm:text-sm transition-colors focus:outline-none"
              style={{
                border: "1px solid var(--border)",
                background: "var(--elevated-surface)",
                color: "var(--text)",
              }}
            />
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold shadow-sm transition-all disabled:opacity-50 mt-1"
              style={{
                background: "var(--color-primary)",
                color: "var(--text-on-primary)",
              }}
            >
              <UserPlus size={14} />{" "}
              {inviteUrl ? "Send another invite" : "Send invite"}
            </button>
          </form>

          {inviteUrl && (
            <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
              <p
                className="text-xs font-medium mb-2"
                style={{ color: "var(--muted)" }}
              >
                Share this invite link:
              </p>
              <div
                className="flex items-center gap-2 p-2.5 rounded-xl"
                style={{
                  background: "var(--elevated-surface)",
                  border: "1px solid var(--border)",
                }}
              >
                <code
                  className="text-xs font-mono break-all flex-1 min-w-0"
                  style={{ color: "var(--color-primary)" }}
                >
                  {inviteUrl}
                </code>
                <button
                  type="button"
                  onClick={copyInviteLink}
                  disabled={copied}
                  title="Copy invite link"
                  className="p-1.5 rounded-lg shrink-0 transition-colors"
                  style={{
                    background: "rgba(var(--color-primary-rgb), 0.12)",
                    color: "var(--color-primary)",
                  }}
                >
                  {copied ? (
                    <Check size={14} style={{ color: "var(--success)" }} />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {memberToDelete && (
        <Modal
          isOpen={!!memberToDelete}
          onClose={closeDeleteConfirm}
          title="Delete member"
          size="sm"
        >
          <div className="space-y-4 pt-1">
            <p className="text-xs sm:text-sm" style={{ color: "var(--text)" }}>
              This will permanently remove{" "}
              <strong>
                {memberToDelete?.name || memberToDelete?.email}
              </strong>{" "}
              from the organization. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={closeDeleteConfirm}
                className="rounded-xl px-3.5 py-1.5 text-xs font-medium transition-colors"
                style={{
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                  background: "var(--elevated-surface)",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={onConfirmDelete}
                className="inline-flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
                style={{
                  background: "var(--danger)",
                  color: "var(--text-on-danger)",
                }}
              >
                <Trash2 size={13} /> {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
