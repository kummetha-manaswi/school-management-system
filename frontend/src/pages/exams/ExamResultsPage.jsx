import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Award, 
  BarChart2, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Calendar, 
  Clock, 
  User, 
  RefreshCw,
  TrendingUp,
  Percent
} from 'lucide-react';
import { 
  useExam, 
  useExamResults, 
  useExamStatistics, 
  useBulkRecordResults,
  usePublishExam,
  useUnpublishExam
} from '../../hooks/useExams';
import ExamResultRosterTable from '../../components/exams/ExamResultRosterTable';

export const ExamResultsPage = () => {
  const { id } = useParams();

  // Queries
  const { data: exam, isLoading: isLoadingExam, isError: isExamError, error: examError } = useExam(id);
  const { data: resultsData, isLoading: isLoadingResults, refetch: refetchResults } = useExamResults(id);
  const { data: statistics, isLoading: isLoadingStats } = useExamStatistics(id);

  // Mutations
  const bulkSaveMutation = useBulkRecordResults();
  const publishMutation = usePublishExam();
  const unpublishMutation = useUnpublishExam();

  const handleBulkSave = async (payload) => {
    return await bulkSaveMutation.mutateAsync({ id, payload });
  };

  const handleTogglePublish = async () => {
    if (!exam) return;
    if (exam.isResultPublished) {
      if (window.confirm('Are you sure you want to unpublish these results? Results will no longer be visible to parents.')) {
        await unpublishMutation.mutateAsync(id);
      }
    } else {
      if (window.confirm('Publish results for this exam? Results will be officially finalized and eligible for parent access.')) {
        await publishMutation.mutateAsync(id);
      }
    }
  };

  if (isLoadingExam) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-600">Loading examination details...</p>
      </div>
    );
  }

  if (isExamError || !exam) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-rose-800">
        <h3 className="text-sm font-bold">Failed to load examination</h3>
        <p className="text-xs text-rose-700 mt-1">
          {examError?.response?.data?.message || examError?.message || 'Examination record not found.'}
        </p>
        <Link
          to="/academic/exams"
          className="mt-3 inline-flex items-center space-x-1.5 px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-medium hover:bg-rose-700 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Exams</span>
        </Link>
      </div>
    );
  }

  const results = resultsData?.results || [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            to="/academic/exams"
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition shadow-sm"
            title="Back to examination list"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2 text-indigo-600 text-xs font-semibold uppercase tracking-wider">
              <Award className="w-4 h-4" />
              <span>Academic & Parent Domain</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mt-0.5">
              Results & Grading: {exam.title}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
              <span>Subject: <strong className="text-slate-700">{exam.subject}</strong></span>
              <span>•</span>
              <span>Class: <strong className="text-slate-700">{exam.className} {exam.section ? `(${exam.section})` : '(All Sections)'}</strong></span>
              <span>•</span>
              <span>Max Marks: <strong className="text-indigo-700">{exam.maxMarks}</strong></span>
              <span>•</span>
              <span>Passing: <strong className="text-emerald-700">{exam.passingMarks}</strong></span>
            </div>
          </div>
        </div>

        {/* Publication Control Card */}
        <div className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-right">
            <div className="flex items-center justify-end space-x-1.5">
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                exam.isResultPublished
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-amber-50 text-amber-700 border-amber-300'
              }`}>
                {exam.isResultPublished ? 'Results Published' : 'Unpublished (Draft)'}
              </span>
            </div>
            {exam.isResultPublished && exam.resultsPublishedAt && (
              <p className="text-[10px] text-slate-400 mt-0.5">
                Published {new Date(exam.resultsPublishedAt).toLocaleDateString()}
              </p>
            )}
          </div>

          <button
            onClick={handleTogglePublish}
            disabled={publishMutation.isPending || unpublishMutation.isPending}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-sm cursor-pointer ${
              exam.isResultPublished
                ? 'bg-amber-50 text-amber-700 border border-amber-300 hover:bg-amber-100'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>
              {publishMutation.isPending || unpublishMutation.isPending
                ? 'Updating...'
                : exam.isResultPublished
                ? 'Unpublish Results'
                : 'Publish Results'}
            </span>
          </button>
        </div>
      </div>

      {/* Class Performance Statistics Panel */}
      {statistics && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
              <BarChart2 className="w-4 h-4 text-indigo-600" />
              <span>Class Performance Analytics</span>
            </div>
            <span className="text-xs text-slate-400">
              {statistics.recordedResults} result(s) recorded
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
              <span className="text-[11px] text-slate-400 font-medium block">Appeared</span>
              <span className="text-xl font-bold text-slate-800 mt-0.5 block">
                {statistics.appeared}
              </span>
            </div>

            <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100 text-center">
              <span className="text-[11px] text-rose-500 font-medium block">Absent</span>
              <span className="text-xl font-bold text-rose-700 mt-0.5 block">
                {statistics.absent}
              </span>
            </div>

            <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-center">
              <span className="text-[11px] text-emerald-600 font-medium block">Pass Rate</span>
              <span className="text-xl font-bold text-emerald-700 mt-0.5 block font-mono">
                {statistics.passRate}%
              </span>
            </div>

            <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-center">
              <span className="text-[11px] text-indigo-600 font-medium block">Class Average</span>
              <span className="text-xl font-bold text-indigo-700 mt-0.5 block font-mono">
                {statistics.averageMarks}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
              <span className="text-[11px] text-slate-400 font-medium block">Highest Score</span>
              <span className="text-xl font-bold text-emerald-600 mt-0.5 block font-mono">
                {statistics.highestMarks}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
              <span className="text-[11px] text-slate-400 font-medium block">Lowest Score</span>
              <span className="text-xl font-bold text-rose-600 mt-0.5 block font-mono">
                {statistics.lowestMarks}
              </span>
            </div>
          </div>

          {/* Grade Distribution Badges */}
          {statistics.gradeDistribution && (
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium text-[11px]">Grades:</span>
              <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 font-medium">
                A+ (≥90%): <strong>{statistics.gradeDistribution.A_plus}</strong>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                A (80-89%): <strong>{statistics.gradeDistribution.A}</strong>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                B (70-79%): <strong>{statistics.gradeDistribution.B}</strong>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                C (60-69%): <strong>{statistics.gradeDistribution.C}</strong>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 border border-orange-200 font-medium">
                D (Pass-59%): <strong>{statistics.gradeDistribution.D}</strong>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-medium">
                F (Fail): <strong>{statistics.gradeDistribution.F}</strong>
              </span>
            </div>
          )}
        </div>
      )}

      {/* Student Roster Table for Marks Entry */}
      <ExamResultRosterTable
        exam={exam}
        existingResults={results}
        onSaveBulk={handleBulkSave}
        isSaving={bulkSaveMutation.isPending}
        saveError={bulkSaveMutation.error}
      />
    </div>
  );
};

export default ExamResultsPage;
