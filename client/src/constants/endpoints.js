export const BASE = 'http://localhost:8001';
// auth endpoints
export const AUTH_IN_ENDPOINT = `${BASE}/auth/in`;
export const AUTH_TOKEN_ENDPOINT = `${BASE}/auth/token`;
export const AUTH_OTP_GENERATE_ENDPOINT = `${BASE}/auth/otp-generate`;
export const AUTH_OTP_VERIFY_ENDPOINT = `${BASE}/auth/otp-verify`;
// interview endpoints
export const INTERVIEW_GET_ENDPOINT = `${BASE}/interview/get`;
export const INTERVIEW_SCHEDULE_ENDPOINT = `${BASE}/interview/schedule`;
export const INTERVIEW_SUBMIT_ENDPOINT = `${BASE}/interview/submit`;
export const INTERVIEW_UPDATE_ENDPOINT = `${BASE}/interview/update`;
// job endpoints
export const JOB_GET_ENDPOINT = `${BASE}/job/get`;
export const JOB_NEW_ENDPOINT = `${BASE}/job/new`;
export const JOB_APPLY_ENDPOINT = `${BASE}/job/apply`;
export const JOB_GET_APPLIS_ENDPOINT = `${BASE}/job/get-applis`;
// question endpoints
export const QUESTION_GET_CV_ENDPOINT = `${BASE}/question/get-cv`;
export const QUESTION_GET_JD_ENDPOINT = `${BASE}/question/get-jd`;
// tool endpoints
export const TOOL_RANK_CVS_ENDPOINT = `${BASE}/tool/rank-cvs`;
// admin endpoints
export const ADMIN_RANK_CVS_ENDPOINT = `${BASE}/admin/rank-cvs`;
export const ADMIN_MASS_MAIL_ENDPOINT = `${BASE}/admin/mass-mail`;
export const ADMIN_SUGGEST_DESC_ENDPOINT = `${BASE}/admin/suggest-desc`;
// file endpoints
export const FILE_UPLOAD_ENDPOINT = `${BASE}/file/upload`;

// API
export const API_BASE = 'http://localhost:8000';
export const API_CV_JD_EVAL_ENDPOINT = `${API_BASE}/eval-CV`;
