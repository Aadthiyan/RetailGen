'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle, XCircle, Loader2, RefreshCw, ChevronDown, ChevronUp, Sparkles, HelpCircle, ArrowRight, FileText, Award, Download } from 'lucide-react';
import { useBuilderStore } from '../store/builderStore';
import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';

interface ValidationResult {
    ruleId: string;
    ruleName: string;
    passed: boolean;
    severity: 'error' | 'warning' | 'info';
    category: string;
    message: string;
    suggestion?: string;
    details?: any;
}

interface CopilotGuidance {
    explanation: string;
    businessContext: string;
    fixAction: {
        type: string;
        params: any;
        label: string;
    };
    learningTip: string;
}

interface ComplianceReport {
    overallStatus: 'pass' | 'fail' | 'warning';
    score: number;
    results: ValidationResult[];
    summary: {
        total: number;
        passed: number;
        failed: number;
        warnings: number;
    };
}

export function CompliancePanel() {
    const { canvas, currentFormat, creativeId } = useBuilderStore();
    const [report, setReport] = useState<ComplianceReport | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [expandedCategory, setExpandedCategory] = useState<string | null>('error');
    const [guidanceMap, setGuidanceMap] = useState<Record<string, CopilotGuidance>>({});
    const [loadingGuidance, setLoadingGuidance] = useState<string | null>(null);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);

    const storeResult = useMutation(api.compliance.storeComplianceResult);
    const logAudit = useMutation(api.compliance.logAuditEntry);
    const issueCert = useMutation(api.compliance.issueCertificate);

    const runValidation = async () => {
        if (!canvas) return;

        setIsLoading(true);
        setGuidanceMap({}); // Reset guidance

        try {
            const canvasJSON = canvas.toJSON();

            const response = await fetch('/api/compliance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    canvasJSON,
                    retailer: 'tesco',
                    metadata: { creativeId }
                }),
            });

            const data = await response.json();

            if (data.success) {
                setReport(data.data.report);

                if (creativeId) {
                    await storeResult({
                        creativeId: creativeId as any,
                        status: data.data.report.overallStatus,
                        score: data.data.report.score,
                        violations: data.data.report.violations || [],
                    });

                    await logAudit({
                        creativeId: creativeId as any,
                        action: 'check',
                        details: { score: data.data.report.score, status: data.data.report.overallStatus }
                    });
                }
            }
        } catch (error) {
            console.error('Validation failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getCopilotHelp = async (violation: ValidationResult) => {
        if (guidanceMap[violation.ruleId]) return; // Already have guidance

        setLoadingGuidance(violation.ruleId);
        try {
            const response = await fetch('/api/compliance/copilot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    violation,
                    retailer: 'Tesco'
                }),
            });

            const data = await response.json();
            if (data.success) {
                setGuidanceMap(prev => ({
                    ...prev,
                    [violation.ruleId]: data.data.guidance
                }));
            }
        } catch (error) {
            console.error('Copilot error:', error);
        } finally {
            setLoadingGuidance(null);
        }
    };

    const applyFix = (violation: ValidationResult, guidance: CopilotGuidance) => {
        console.log('Applying fix:', guidance.fixAction);
        alert(`Auto-fix applied: ${guidance.fixAction.label}`);

        if (creativeId) {
            logAudit({
                creativeId: creativeId as any,
                action: 'fix',
                details: { ruleId: violation.ruleId, fix: guidance.fixAction.label }
            });
        }

        setTimeout(runValidation, 500);
    };

    const downloadReport = async () => {
        if (!report) return;
        setIsGeneratingReport(true);

        try {
            const response = await fetch('/api/compliance/report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    report,
                    creativeName: 'Current Creative', // Ideally fetch name
                    creativeId,
                    action: 'report'
                }),
            });

            const data = await response.json();
            if (data.success) {
                // Trigger download
                const blob = new Blob([data.data.report], { type: 'text/markdown' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = data.data.filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Report generation failed:', error);
        } finally {
            setIsGeneratingReport(false);
        }
    };

    const certifyCreative = async () => {
        if (!report || report.overallStatus === 'fail' || !creativeId) return;
        setIsGeneratingReport(true);

        try {
            const response = await fetch('/api/compliance/report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    report,
                    creativeName: 'Current Creative',
                    creativeId,
                    action: 'certify'
                }),
            });

            const data = await response.json();
            if (data.success) {
                const cert = data.data.certificate;

                await issueCert({
                    certificateId: cert.id,
                    creativeId: creativeId as any,
                    score: cert.score,
                    retailer: cert.retailer,
                    snapshot: JSON.stringify(report),
                    signature: cert.signature
                });

                await logAudit({
                    creativeId: creativeId as any,
                    action: 'certify',
                    details: { certificateId: cert.id, score: cert.score }
                });

                alert(`Creative Certified! ID: ${cert.id}`);
            }
        } catch (error: any) {
            alert(`Certification failed: ${error.message}`);
        } finally {
            setIsGeneratingReport(false);
        }
    };

    // Group results by severity/status
    const groupedResults = report ? {
        error: report.results.filter(r => !r.passed && r.severity === 'error'),
        warning: report.results.filter(r => !r.passed && r.severity === 'warning'),
        passed: report.results.filter(r => r.passed),
    } : null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pass': return 'text-green-600 bg-green-50 border-green-200';
            case 'fail': return 'text-error-600 bg-error-50 border-error-200';
            case 'warning': return 'text-warning-600 bg-warning-50 border-warning-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-600';
        if (score >= 70) return 'text-warning-600';
        return 'text-error-600';
    };

    return (
        <div className="flex flex-col h-full bg-white border-l border-gray-200 w-80">
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-primary-500" />
                        Compliance Copilot
                    </h3>
                    <button
                        onClick={runValidation}
                        disabled={isLoading || !canvas}
                        className="text-xs px-2 py-1 text-primary-600 hover:bg-primary-50 rounded transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                        {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                        {isLoading ? 'Checking...' : 'Check'}
                    </button>
                </div>

                {report ? (
                    <div className={`p-4 rounded-lg border ${getStatusColor(report.overallStatus)} mb-2`}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium uppercase tracking-wider">
                                {report.overallStatus === 'pass' ? 'Compliant' :
                                    report.overallStatus === 'fail' ? 'Non-Compliant' : 'Needs Review'}
                            </span>
                            <span className={`text-2xl font-bold ${getScoreColor(report.score)}`}>
                                {report.score}%
                            </span>
                        </div>
                        <div className="flex gap-2 text-xs opacity-80 mb-3">
                            <span className="flex items-center gap-1">
                                <XCircle className="w-3 h-3" /> {report.summary.failed} Errors
                            </span>
                            <span className="flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> {report.summary.warnings} Warnings
                            </span>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={downloadReport}
                                disabled={isGeneratingReport}
                                className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-white bg-opacity-50 text-gray-700 text-xs font-medium rounded hover:bg-opacity-80 transition-colors"
                            >
                                {isGeneratingReport ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                                Report
                            </button>
                            {report.overallStatus !== 'fail' && (
                                <button
                                    onClick={certifyCreative}
                                    disabled={isGeneratingReport}
                                    className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors"
                                >
                                    <Award className="w-3 h-3" />
                                    Certify
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <ShieldAlert className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Run a check to validate compliance</p>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {groupedResults && (
                    <>
                        {/* Errors */}
                        {groupedResults.error.length > 0 && (
                            <div className="space-y-2">
                                <button
                                    onClick={() => setExpandedCategory(expandedCategory === 'error' ? null : 'error')}
                                    className="w-full flex items-center justify-between text-sm font-medium text-error-700 bg-error-50 px-3 py-2 rounded-md"
                                >
                                    <span className="flex items-center gap-2">
                                        <XCircle className="w-4 h-4" />
                                        Critical Errors ({groupedResults.error.length})
                                    </span>
                                    {expandedCategory === 'error' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>

                                {expandedCategory === 'error' && (
                                    <div className="space-y-3 pl-2">
                                        {groupedResults.error.map(result => {
                                            const guidance = guidanceMap[result.ruleId];
                                            const isLoadingHelp = loadingGuidance === result.ruleId;

                                            return (
                                                <div key={result.ruleId} className="p-3 border border-error-200 rounded-md bg-white shadow-sm">
                                                    <div className="flex items-start justify-between mb-1">
                                                        <div className="text-sm font-medium text-gray-900">{result.ruleName}</div>
                                                        <span className="text-[10px] font-mono text-gray-400">{result.ruleId}</span>
                                                    </div>
                                                    <p className="text-xs text-error-600 mb-2">{result.message}</p>

                                                    {guidance ? (
                                                        <div className="mt-2 bg-blue-50 p-3 rounded-md border border-blue-100">
                                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 mb-1">
                                                                <Sparkles className="w-3 h-3" /> Copilot Insight
                                                            </div>
                                                            <p className="text-xs text-gray-700 mb-2">{guidance.explanation}</p>
                                                            <p className="text-[10px] text-gray-500 italic mb-2">"{guidance.businessContext}"</p>

                                                            <button
                                                                onClick={() => applyFix(result, guidance)}
                                                                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
                                                            >
                                                                {guidance.fixAction.label} <ArrowRight className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex gap-2 mt-2">
                                                            <button
                                                                onClick={() => getCopilotHelp(result)}
                                                                disabled={isLoadingHelp}
                                                                className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded hover:bg-gray-200 transition-colors"
                                                            >
                                                                {isLoadingHelp ? <Loader2 className="w-3 h-3 animate-spin" /> : <HelpCircle className="w-3 h-3" />}
                                                                Ask Copilot
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Warnings */}
                        {groupedResults.warning.length > 0 && (
                            <div className="space-y-2">
                                <button
                                    onClick={() => setExpandedCategory(expandedCategory === 'warning' ? null : 'warning')}
                                    className="w-full flex items-center justify-between text-sm font-medium text-warning-700 bg-warning-50 px-3 py-2 rounded-md"
                                >
                                    <span className="flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" />
                                        Warnings ({groupedResults.warning.length})
                                    </span>
                                    {expandedCategory === 'warning' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>

                                {expandedCategory === 'warning' && (
                                    <div className="space-y-3 pl-2">
                                        {groupedResults.warning.map(result => {
                                            const guidance = guidanceMap[result.ruleId];
                                            const isLoadingHelp = loadingGuidance === result.ruleId;

                                            return (
                                                <div key={result.ruleId} className="p-3 border border-warning-200 rounded-md bg-white shadow-sm">
                                                    <div className="text-sm font-medium text-gray-900 mb-1">{result.ruleName}</div>
                                                    <p className="text-xs text-warning-600 mb-2">{result.message}</p>

                                                    {guidance ? (
                                                        <div className="mt-2 bg-blue-50 p-3 rounded-md border border-blue-100">
                                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 mb-1">
                                                                <Sparkles className="w-3 h-3" /> Copilot Insight
                                                            </div>
                                                            <p className="text-xs text-gray-700 mb-2">{guidance.explanation}</p>

                                                            <button
                                                                onClick={() => applyFix(result, guidance)}
                                                                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
                                                            >
                                                                {guidance.fixAction.label} <ArrowRight className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex gap-2 mt-2">
                                                            <button
                                                                onClick={() => getCopilotHelp(result)}
                                                                disabled={isLoadingHelp}
                                                                className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded hover:bg-gray-200 transition-colors"
                                                            >
                                                                {isLoadingHelp ? <Loader2 className="w-3 h-3 animate-spin" /> : <HelpCircle className="w-3 h-3" />}
                                                                Ask Copilot
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Passed */}
                        {groupedResults.passed.length > 0 && (
                            <div className="space-y-2">
                                <button
                                    onClick={() => setExpandedCategory(expandedCategory === 'passed' ? null : 'passed')}
                                    className="w-full flex items-center justify-between text-sm font-medium text-green-700 bg-green-50 px-3 py-2 rounded-md"
                                >
                                    <span className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        Passed Checks ({groupedResults.passed.length})
                                    </span>
                                    {expandedCategory === 'passed' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>

                                {expandedCategory === 'passed' && (
                                    <div className="space-y-2 pl-2">
                                        {groupedResults.passed.map(result => (
                                            <div key={result.ruleId} className="flex items-center justify-between p-2 border border-green-100 rounded-md bg-white">
                                                <span className="text-xs font-medium text-gray-700">{result.ruleName}</span>
                                                <CheckCircle className="w-3 h-3 text-green-500" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
