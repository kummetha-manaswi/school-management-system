import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, GraduationCap, RefreshCw } from 'lucide-react';
import { useStudent, useCreateStudent, useUpdateStudent } from '../../hooks/useStudents';
import StudentForm from '../../components/students/StudentForm';

export const StudentFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  // Queries & Mutations
  const { data: student, isLoading, isError, error: fetchError } = useStudent(id);
  const createMutation = useCreateStudent();
  const updateMutation = useUpdateStudent();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const submitError = createMutation.error || updateMutation.error;

  const handleSubmit = async (formData) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id, data: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      navigate('/academic/students');
    } catch (err) {
      console.error('Failed to submit student form:', err);
    }
  };

  if (isEdit && isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-600">Loading student details...</p>
      </div>
    );
  }

  if (isEdit && isError) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-rose-800">
        <h3 className="text-sm font-bold">Failed to load student for editing</h3>
        <p className="text-xs text-rose-700 mt-1">
          {fetchError?.response?.data?.message || fetchError?.message || 'Record not found.'}
        </p>
        <Link
          to="/academic/students"
          className="mt-3 inline-flex items-center space-x-1.5 px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-medium hover:bg-rose-700 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Students</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link
            to="/academic/students"
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition shadow-sm"
            title="Back to list"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2 text-indigo-600 text-xs font-semibold uppercase tracking-wider">
              <GraduationCap className="w-4 h-4" />
              <span>Academic & Parent Domain</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mt-0.5">
              {isEdit ? 'Edit Student Profile' : 'New Student Registration'}
            </h2>
          </div>
        </div>
      </div>

      {/* Form */}
      <StudentForm
        initialData={student}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        error={submitError}
        isEdit={isEdit}
      />
    </div>
  );
};

export default StudentFormPage;
