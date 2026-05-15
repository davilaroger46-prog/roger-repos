export const API_ROUTES = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    me: "/auth/me",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
    changePassword: "/auth/change-password",
  },

  ai: {
    generateCase: "/ai/generate-case",
    autocorrectCase: "/ai/autocorrect-case",
  },

  cases: {
    list: "/cases/",
    stats: "/cases/stats",
    detail: (id) => `/cases/${id}`,
    pdf: (id) => `/cases/${id}/pdf`,
    pdfDraft: (id) => `/cases/${id}/pdf-draft`,

    submitReview: (id) => `/cases/${id}/submit-review`,
    review: (id) => `/cases/${id}/review`,

    shares: (id) => `/cases/${id}/shares`,
    removeShare: (caseId, shareId) => `/cases/${caseId}/shares/${shareId}`,

    versions: (id) => `/cases/${id}/versions`,
    versionDetail: (caseId, versionId) =>
      `/cases/${caseId}/versions/${versionId}`,
    restoreVersion: (caseId, versionId) =>
      `/cases/${caseId}/versions/${versionId}/restore`,
  },

  admin: {
    stats: "/admin/stats",
    users: "/admin/users",
    userRole: (id) => `/admin/users/${id}/role`,
    seedDemo: "/admin/seed-demo",
  },
};
