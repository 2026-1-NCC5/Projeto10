import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useAuth } from "../../contexts/AuthContext";
import * as api from "../../services/api";
import type {
  ComparisonEvidence,
  DashboardAllSummary,
  DashboardComparison,
  DashboardSummary,
  Team,
} from "../../types";
import GlassPanel from "../../components/GlassPanel/GlassPanel";
import EvidenceModal from "../../components/EvidenceModal/EvidenceModal";
import { palette } from "../../theme/palette";
import {
  DashboardRoot,
  PageTitle,
  PageSubtitle,
  ChartsGrid,
  ChartPanel,
  ChartTitle,
  SectionHeader,
  ComparisonTable,
  ComparisonHeaderRow,
  ComparisonRow,
  StatusPill,
  EvidenceButton,
  SelectorRow,
  Select,
} from "./styles";


const CATEGORY_COLORS = [palette.primary.main, "#4DB5F5", palette.tertiary.main];


function DashboardPage() {
  const { token, user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [teams, setTeams] = useState<Team[]>([]);
  const [teamId, setTeamId] = useState<string>("");
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [allSummary, setAllSummary] = useState<DashboardAllSummary | null>(null);
  const [comparison, setComparison] = useState<DashboardComparison | null>(null);

  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [evidenceCategory, setEvidenceCategory] = useState<string | null>(null);
  const [evidenceItems, setEvidenceItems] = useState<ComparisonEvidence[]>([]);

  useEffect(() => {
    if (!token) return;
    if (isAdmin) {
      api
        .getTeams(token)
        .then((ts) => {
          setTeams(ts);
          if (ts.length > 0) setTeamId(ts[0].id);
        })
        .catch(() => setTeams([]));
      api.getDashboardAllSummary(token).then(setAllSummary).catch(() => setAllSummary(null));
    } else if (user?.team_id) {
      setTeamId(user.team_id);
    }
  }, [token, isAdmin, user?.team_id]);

  useEffect(() => {
    if (!token || !teamId) return;
    api.getDashboardSummary(token, teamId).then(setSummary).catch(() => setSummary(null));
    api.getDashboardComparison(token, teamId).then(setComparison).catch(() => setComparison(null));
  }, [token, teamId]);

  const categoryBars = useMemo(() => {
    if (!summary) return [];
    return summary.countsByCategory.map((c) => ({
      name: c.category,
      weight: Number(c.totalWeightG.toFixed(0)),
      count: c.count,
    }));
  }, [summary]);

  const pieData = useMemo(() => {
    if (!summary) return [];
    return summary.countsByCategory
      .filter((c) => c.count > 0)
      .map((c) => ({ name: c.category, value: c.count }));
  }, [summary]);

  const lineData = useMemo(() => {
    if (!summary) return [];
    return summary.timeseries.map((p) => ({
      date: p.date,
      weight: Number(p.totalWeightG.toFixed(0)),
    }));
  }, [summary]);

  const allTeamsData = useMemo(() => {
    if (!allSummary) return [];
    return allSummary.teams.map((t) => {
      const row: Record<string, string | number> = { name: t.teamName };
      t.byCategory.forEach((c) => {
        row[c.category] = Number(c.totalWeightG.toFixed(0));
      });
      return row;
    });
  }, [allSummary]);

  function openEvidence(category: string, evidence: ComparisonEvidence[]) {
    setEvidenceCategory(category);
    setEvidenceItems(evidence);
    setEvidenceOpen(true);
  }

  return (
    <DashboardRoot>
      <PageTitle>Dashboard</PageTitle>
      <PageSubtitle>
        Análise das detecções da IA — fonte única de verdade para os dashboards.
      </PageSubtitle>

      {isAdmin && (
        <SelectorRow>
          <Select value={teamId} onChange={(e) => setTeamId(e.target.value)}>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
        </SelectorRow>
      )}

      <ChartsGrid>
        <GlassPanel>
          <ChartPanel>
            <ChartTitle>Peso total por categoria (g)</ChartTitle>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryBars}>
                <CartesianGrid strokeDasharray="3 3" stroke={palette.neutral.outlineVariant} />
                <XAxis dataKey="name" stroke={palette.neutral.onSurfaceVariant} />
                <YAxis stroke={palette.neutral.onSurfaceVariant} />
                <Tooltip />
                <Bar dataKey="weight" fill={palette.primary.main} />
              </BarChart>
            </ResponsiveContainer>
          </ChartPanel>
        </GlassPanel>

        <GlassPanel>
          <ChartPanel>
            <ChartTitle>Distribuição por categoria</ChartTitle>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={80} label>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartPanel>
        </GlassPanel>

        <GlassPanel>
          <ChartPanel>
            <ChartTitle>Peso total ao longo do tempo (g)</ChartTitle>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke={palette.neutral.outlineVariant} />
                <XAxis dataKey="date" stroke={palette.neutral.onSurfaceVariant} />
                <YAxis stroke={palette.neutral.onSurfaceVariant} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke={palette.primary.main}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartPanel>
        </GlassPanel>

        {isAdmin && (
          <GlassPanel>
            <ChartPanel>
              <ChartTitle>Comparação entre equipes (g por categoria)</ChartTitle>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={allTeamsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={palette.neutral.outlineVariant} />
                  <XAxis dataKey="name" stroke={palette.neutral.onSurfaceVariant} />
                  <YAxis stroke={palette.neutral.onSurfaceVariant} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="arroz" stackId="a" fill={CATEGORY_COLORS[0]} />
                  <Bar dataKey="feijao" stackId="a" fill={CATEGORY_COLORS[1]} />
                  <Bar dataKey="outros" stackId="a" fill={CATEGORY_COLORS[2]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartPanel>
          </GlassPanel>
        )}
      </ChartsGrid>

      <SectionHeader>Manual × IA — comparação por categoria</SectionHeader>
      <GlassPanel>
        <ComparisonTable>
          <ComparisonHeaderRow>
            <div>Categoria</div>
            <div>Manual (qtd)</div>
            <div>Manual (peso)</div>
            <div>IA (qtd)</div>
            <div>IA (peso g)</div>
            <div>Status</div>
            <div>Evidência</div>
          </ComparisonHeaderRow>
          {comparison?.categories.map((c) => (
            <ComparisonRow key={c.category} mismatch={!c.match}>
              <div style={{ textTransform: "capitalize" }}>{c.category}</div>
              <div>{c.manualCount}</div>
              <div>{c.manualWeightG.toFixed(1)}</div>
              <div>{c.aiCount}</div>
              <div>{c.aiWeightG.toFixed(0)}</div>
              <div>
                <StatusPill ok={c.match}>{c.match ? "Match" : "Divergência"}</StatusPill>
              </div>
              <div>
                {!c.match && c.evidence.length > 0 && (
                  <EvidenceButton onClick={() => openEvidence(c.category, c.evidence)}>
                    Ver evidência
                  </EvidenceButton>
                )}
              </div>
            </ComparisonRow>
          ))}
        </ComparisonTable>
      </GlassPanel>

      <EvidenceModal
        open={evidenceOpen}
        onClose={() => setEvidenceOpen(false)}
        category={evidenceCategory}
        evidence={evidenceItems}
      />
    </DashboardRoot>
  );
}

export default DashboardPage;
