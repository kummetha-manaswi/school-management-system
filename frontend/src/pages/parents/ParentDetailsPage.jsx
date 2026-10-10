import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Lock,
  RefreshCw,
  HeartHandshake,
  Trash2,
  Check,
  X,
  Search,
  Clock,
  UserX
} from 'lucide-react';
import {
  useParent,
  useUpdateParentStatus,
  useUpdateParent,
  useLinkStudent,
  useVerifyRelationship,
  useRevokeRelationship
} from '../../hooks/useParents';
import { useStudents } from '../../hooks/useStudents';

export const ParentDetailsPage = () => {
  const { id } = useParams();

  // Queries
  const { data, isLoading, isError, error, refetch, isFetching } = useParent(id);
  const parent = data?.parent;
  const relationships = data?.relationships || [];

  // Mutations
  const updateStatusMutation = useUpdateParentStatus();
  const updateParentMutation = useUpdateParent();
  const linkStudentMutation = useLinkStudent();
  const verifyRelationshipMutation = useVerifyRelationship();
  const revokeRelationshipMutation = useRevokeRelationship();

  // Link Student Modal State
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [relationshipType, setRelationshipType] = useState('father');
  const [linkStatus, setLinkStatus] = useState('verified');
  const [linkNotes, setLinkNotes] = useState('');
  const [linkError, setLinkError] = useState('');

  // Revoke Modal State
  const [revokeModalData, setRevokeModalData] = useState(null); // { relationshipId, studentName }
  const [revocationReason, setRevocationReason] = useState('');
  const [revokeError, setRevokeError] = useState('');

  // Edit Parent Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    occupation: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [editError, setEditError] = useState('');

  // Fetch students for linking
  const { data: studentsData, isLoading: isLoadingStudents } = useStudents({
    search: studentSearchTerm,
    limit: 15,
  });
  const availableStudents = studentsData?.students || [];

  // Open Edit Modal
  const handleOpenEditModal = () => {
    if (!parent) return;
    setEditFormData({
      firstName: parent.firstName || '',
      lastName: parent.lastName || '',
      phone: parent.phone || '',
      occupation: parent.occupation || '',
      address: parent.address || '',
      city: parent.city || '',
      state: parent.state || '',
      pincode: parent.pincode || '',
    });
    setEditError('');
    setIsEditModalOpen(true);
  };

  const handleSaveParentEdit = async (e) => {
    e.preventDefault();
    setEditError('');
    try {
      await updateParentMutation.mutateAsync({
        id,
        data: editFormData,
      });
      setIsEditModalOpen(false);
      refetch();
    } catch (err) {
      setEditError(err.response?.data?.message || err.message || 'Failed to update parent details.');
    }
  };

  // Toggle Account Status
  const handleToggleStatus = async () => {
    if (!parent) return;
    const nextStatus = parent.status === 'active' ? 'inactive' : 'active';
    const confirmMsg = `Are you sure you want to ${nextStatus === 'active' ? 'activate' : 'deactivate'} this parent account?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await updateStatusMutation.mutateAsync({ id, status: nextStatus });
      refetch();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to update status');
    }
  };

  // Handle Link Student Submit
  const handleLinkStudent = async (e) => {
    e.preventDefault();
    setLinkError('');

    if (!selectedStudentId) {
      setLinkError('Please select a student to link.');
      return;
    }

    try {
      await linkStudentMutation.mutateAsync({
        parentId: id,
        data: {
          studentId: selectedStudentId,
          relationshipType,
          status: linkStatus,
          notes: linkNotes,
        },
      });
      setIsLinkModalOpen(false);
      setSelectedStudentId('');
      setLinkNotes('');
      setStudentSearchTerm('');
      refetch();
    } catch (err) {
      setLinkError(err.response?.data?.message || err.message || 'Failed to link student.');
    }
  };

  // Handle Verify Relationship
  const handleVerify = async (relationshipId) => {
    if (!window.confirm('Verify this parent-student relationship?')) return;
    try {
      await verifyRelationshipMutation.mutateAsync(relationshipId);
      refetch();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to verify relationship.');
    }
  };

  // Handle Revoke Relationship
  const handleRevokeSubmit = async (e) => {
    e.preventDefault();
    setRevokeError('');
    if (!revokeModalData) return;

    try {
      await revokeRelationshipMutation.mutateAsync({
        relationshipId: revokeModalData.relationshipId,
        reason: revocationReason,
      });
      setRevokeModalData(null);
      setRevocationReason('');
      refetch();
    } catch (err) {
      setRevokeError(err.response?.data?.message || err.message || 'Failed to revoke relationship.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="mt-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Loading parent details...</p>
      </div>
    );
  }

  if (isError || !parent) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-xl mx-auto my-8">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-red-900">Failed to Load Parent Account</h3>
        <p className="text-xs text-red-700 mt-1">
          {error?.response?.data?.message || error?.message || 'The requested parent record could not be found.'}
        </p>
        <Link
          to="/academic/parents"
          className="inline-flex items-center space-x-1.5 mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Parents List</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <Link
            to="/academic/parents"
            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition shadow-sm"
            title="Back to parent accounts"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {parent.firstName} {parent.lastName}
              </h1>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  parent.status === 'active'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : parent.status === 'suspended'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {parent.status}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Parent ID: <span className="font-mono text-slate-600">{parent._id}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 border border-slate-200 bg-white rounded-lg text-slate-600 hover:bg-slate-50 text-xs transition shadow-sm flex items-center space-x-1"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
          <button
            onClick={handleOpenEditModal}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
          >
            Edit Profile
          </button>
          <button
            onClick={handleToggleStatus}
            disabled={updateStatusMutation.isPending}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition ${
              parent.status === 'active'
                ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {parent.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
          </button>
        </div>
      </div>

      {/* Main Content Grid: Parent Details & Linked Students */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Parent Details Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
              Parent Profile Information
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-start space-x-3">
                <Mail className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Email Address</span>
                  <span className="font-medium text-slate-800 break-all">{parent.email}</span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Phone className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Phone Number</span>
                  <span className="font-medium text-slate-800">{parent.phone || 'Not provided'}</span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Briefcase className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Occupation</span>
                  <span className="font-medium text-slate-800">{parent.occupation || 'Not provided'}</span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Residential Address</span>
                  <span className="font-medium text-slate-800">
                    {[parent.address, parent.city, parent.state, parent.pincode].filter(Boolean).join(', ') || 'Not provided'}
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Calendar className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Registered On</span>
                  <span className="font-medium text-slate-800">
                    {new Date(parent.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center space-x-1">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Password protected</span>
              </span>
              <span className="font-mono text-slate-400">Token v{parent.tokenVersion || 0}</span>
            </div>
          </div>

          {/* Security & Verification Notice */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-xs text-indigo-900 space-y-2">
            <div className="flex items-center space-x-2 font-semibold text-indigo-950">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Administrative Verification Policy</span>
            </div>
            <p className="text-[11px] text-indigo-800 leading-relaxed">
              Only verified parent-student relationships grant access to academic records once parent APIs are deployed.
              Ensure supporting documentation is checked prior to verification.
            </p>
          </div>
        </div>

        {/* Right Column: Linked Students (Children) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
              <div className="flex items-center space-x-2">
                <HeartHandshake className="w-4 h-4 text-indigo-600" />
                <h2 className="text-sm font-bold text-slate-800">
                  Linked Students ({relationships.length})
                </h2>
              </div>
              <button
                onClick={() => {
                  setLinkError('');
                  setSelectedStudentId('');
                  setLinkNotes('');
                  setIsLinkModalOpen(true);
                }}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Link Student</span>
              </button>
            </div>

            {/* Relationships Table / Empty State */}
            {relationships.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">No Students Linked Yet</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  This parent account does not have any linked student relationships. Click "Link Student" above to establish a link.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-3">Class & Section</th>
                      <th className="py-3 px-3">Relationship</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {relationships.map((rel) => {
                      const student = rel.student;
                      const isVerified = rel.status === 'verified';
                      const isRevoked = rel.status === 'revoked';
                      const isPending = rel.status === 'pending';

                      return (
                        <tr key={rel._id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4">
                            {student ? (
                              <div>
                                <div className="font-semibold text-slate-800">
                                  {student.firstName} {student.lastName}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  Adm: {student.admissionNumber} {student.rollNumber ? `• Roll: ${student.rollNumber}` : ''}
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Student record not found</span>
                            )}
                          </td>
                          <td className="py-3 px-3 font-medium text-slate-700">
                            {student ? `${student.className || '-'} (${student.section || '-'})` : '-'}
                          </td>
                          <td className="py-3 px-3">
                            <span className="capitalize font-medium text-slate-700">
                              {rel.relationshipType || 'Guardian'}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div>
                              <span
                                className={`inline-flex items-center space-x-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                                  isVerified
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : isRevoked
                                    ? 'bg-red-50 text-red-700 border-red-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}
                              >
                                {isVerified && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                                {isRevoked && <XCircle className="w-3 h-3 text-red-600" />}
                                {isPending && <Clock className="w-3 h-3 text-amber-600" />}
                                <span>{rel.status}</span>
                              </span>

                              {isVerified && rel.verifiedAt && (
                                <p className="text-[10px] text-slate-400 mt-0.5">
                                  Verified: {new Date(rel.verifiedAt).toLocaleDateString()}
                                </p>
                              )}

                              {isRevoked && rel.revocationReason && (
                                <p className="text-[10px] text-red-600 mt-0.5 italic">
                                  Reason: {rel.revocationReason}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              {/* Verify Button (for pending or revoked) */}
                              {!isVerified && (
                                <button
                                  onClick={() => handleVerify(rel._id)}
                                  disabled={verifyRelationshipMutation.isPending}
                                  className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold shadow-xs transition"
                                  title="Verify relationship"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Verify</span>
                                </button>
                              )}

                              {/* Revoke Button (for verified or pending) */}
                              {!isRevoked && (
                                <button
                                  onClick={() => {
                                    setRevokeModalData({
                                      relationshipId: rel._id,
                                      studentName: student ? `${student.firstName} ${student.lastName}` : 'this student',
                                    });
                                    setRevocationReason('');
                                    setRevokeError('');
                                  }}
                                  disabled={revokeRelationshipMutation.isPending}
                                  className="inline-flex items-center space-x-1 px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded text-[11px] font-semibold transition"
                                  title="Revoke relationship"
                                >
                                  <UserX className="w-3 h-3" />
                                  <span>Revoke</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL 1: Link Student */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold">Link Student to Parent</h3>
              </div>
              <button
                onClick={() => setIsLinkModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLinkStudent} className="p-6 space-y-4">
              {linkError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span>{linkError}</span>
                </div>
              )}

              {/* Student Search / Selector */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Search & Select Student <span className="text-red-500">*</span>
                </label>
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={studentSearchTerm}
                    onChange={(e) => setStudentSearchTerm(e.target.value)}
                    placeholder="Search by student name or admission number..."
                    className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100 bg-slate-50">
                  {isLoadingStudents ? (
                    <div className="p-4 text-center text-xs text-slate-400">Loading students...</div>
                  ) : availableStudents.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">No students found</div>
                  ) : (
                    availableStudents.map((st) => (
                      <div
                        key={st._id}
                        onClick={() => setSelectedStudentId(st._id)}
                        className={`p-2.5 text-xs cursor-pointer flex items-center justify-between transition ${
                          selectedStudentId === st._id
                            ? 'bg-indigo-50 border-l-4 border-indigo-600 text-indigo-900 font-semibold'
                            : 'hover:bg-white text-slate-700'
                        }`}
                      >
                        <div>
                          <div>
                            {st.firstName} {st.lastName}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Adm: {st.admissionNumber} • Class: {st.className} ({st.section})
                          </div>
                        </div>
                        {selectedStudentId === st._id && (
                          <Check className="w-4 h-4 text-indigo-600" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Relationship Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Relationship Type
                  </label>
                  <select
                    value={relationshipType}
                    onChange={(e) => setRelationshipType(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="father">Father</option>
                    <option value="mother">Mother</option>
                    <option value="guardian">Guardian</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Initial Status
                  </label>
                  <select
                    value={linkStatus}
                    onChange={(e) => setLinkStatus(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="verified">Verified (Immediate)</option>
                    <option value="pending">Pending Verification</option>
                  </select>
                </div>
              </div>

              {/* Administrative Notes */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Administrative Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={linkNotes}
                  onChange={(e) => setLinkNotes(e.target.value)}
                  placeholder="e.g. Identity document verified via office records"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Footer */}
              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLinkModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={linkStudentMutation.isPending || !selectedStudentId}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-md transition disabled:opacity-60"
                >
                  {linkStudentMutation.isPending ? 'Linking...' : 'Link Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Revoke Relationship */}
      {revokeModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 bg-red-600 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserX className="w-5 h-5 text-white" />
                <h3 className="text-base font-bold">Revoke Relationship Link</h3>
              </div>
              <button
                onClick={() => setRevokeModalData(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRevokeSubmit} className="p-6 space-y-4">
              <p className="text-xs text-slate-700 leading-relaxed">
                Are you sure you want to revoke the link between <strong>{parent.firstName} {parent.lastName}</strong> and <strong>{revokeModalData.studentName}</strong>?
              </p>

              {revokeError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span>{revokeError}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Reason for Revocation
                </label>
                <textarea
                  rows={2}
                  value={revocationReason}
                  onChange={(e) => setRevocationReason(e.target.value)}
                  placeholder="e.g. Custody change, duplicate link, or parent requested unlink"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRevokeModalData(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={revokeRelationshipMutation.isPending}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-md transition disabled:opacity-60"
                >
                  {revokeRelationshipMutation.isPending ? 'Revoking...' : 'Confirm Revoke'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Edit Parent Profile */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <h3 className="text-base font-bold">Edit Parent Profile</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveParentEdit} className="p-6 space-y-4">
              {editError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">First Name</label>
                  <input
                    type="text"
                    value={editFormData.firstName}
                    onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Last Name</label>
                  <input
                    type="text"
                    value={editFormData.lastName}
                    onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Phone</label>
                  <input
                    type="text"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Occupation</label>
                  <input
                    type="text"
                    value={editFormData.occupation}
                    onChange={(e) => setEditFormData({ ...editFormData, occupation: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Street Address</label>
                <input
                  type="text"
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">City</label>
                  <input
                    type="text"
                    value={editFormData.city}
                    onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">State</label>
                  <input
                    type="text"
                    value={editFormData.state}
                    onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Pincode</label>
                  <input
                    type="text"
                    value={editFormData.pincode}
                    onChange={(e) => setEditFormData({ ...editFormData, pincode: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateParentMutation.isPending}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-md transition disabled:opacity-60"
                >
                  {updateParentMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentDetailsPage;
