export const API_ROUTES = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    me: "/auth/me",
  },
  ai: {
    generateCase: "/ai/generate-case",
    autocorrectCase: "/ai/autocorrect-case",
  },
  cases: {
    list: "/cases/",
    detail: (id) => `/cases/${id}`,
    pdf: (id) => `/cases/${id}/pdf`,
    submitReview: (id) => `/cases/${id}/submit-review`,
    review: (id) => `/cases/${id}/review`,
    versions: (id) => `/cases/${id}/versions`,
    versionDetail: (caseId, versionId) =>
      `/cases/${caseId}/versions/${versionId}`,
    restoreVersion: (caseId, versionId) =>
      `/cases/${caseId}/versions/${versionId}/restore`,
  },
};
