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
  FoodDistributionResponse,
  OperatorComparisonResponse,
  Team,
} from "../../types";
import GlassPanel from "../../components/GlassPanel/GlassPanel";
import EvidenceModal from "../../components/EvidenceModal/EvidenceModal";
import ErrorBoundary from "../../components/ErrorBoundary/ErrorBoundary";
import MetricCard from "../../components/MetricCard/MetricCard";
import TeamTabs from "../../components/TeamTabs/TeamTabs";
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
  TeamContextLabel,
  MetricsGrid,
} from "./styles";


const CATEGORY_COLORS = [palette.primary.main, "#4DB5F5", palette.tertiary.main];

const FOOD_COLORS = [
  palette.primary.main,
  "#4DB5F5",
  palette.tertiary.main,
  "#F5A623",
  "#9B59B6",
  "#E74C3C",
  "#1ABC9C",
  "#F39C12",
];

const BASE_CATEGORIES = ["arroz", "feijao", "outros"];


function safeNumber(value: number | null | undefined): number {
  return Number(value ?? 0);
}


function DashboardPage() {
  const { token, user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isCoordinator = user?.role === "coordinator";

  const [teams, setTeams] = useState<Team[]>([]);
  const [teamId, setTeamId] = useState<string>("");
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [allSummary, setAllSummary] = useState<DashboardAllSummary | null>(null);
  const [comparison, setComparison] = useState<DashboardComparison | null>(null);
  const [operatorComparison, setOperatorComparison] = useState<OperatorComparisonResponse | null>(null);
  const [foodDistribution, setFoodDistribution] = useState<FoodDistributionResponse | null>(null);

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
    api
      .getOperatorComparison(token, teamId)
      .then(setOperatorComparison)
      .catch(() => setOperatorComparison(null));
    api
      .getFoodDistribution(token, teamId)
      .then(setFoodDistribution)
      .catch(() => setFoodDistribution(null));
  }, [token, teamId]);

  const categoryBars = useMemo(() => {
    if (!summary) return [];
    return summary.countsByCategory.map((c) => ({
      name: c.category,
      weight: Number(safeNumber(c.totalWeightG).toFixed(0)),
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
      weight: Number(safeNumber(p.totalWeightG).toFixed(0)),
    }));
  }, [summary]);

  const allTeamsData = useMemo(() => {
    if (!allSummary) return [];
    return allSummary.teams.map((t) => {
      const row: Record<string, string | number> = { name: t.teamName };
      t.byCategory.forEach((c) => {
        row[c.category] = Number(safeNumber(c.totalWeightG).toFixed(0));
      });
      return row;
    });
  }, [allSummary]);

  const operatorChartData = useMemo(() => {
    if (!operatorComparison) return [];
    return operatorComparison.operators.map((o) => ({
      name: o.operatorName,
      manual: Number(safeNumber(o.manualWeightG * 1000).toFixed(0)),
      ai: Number(safeNumber(o.aiWeightG).toFixed(0)),
    }));
  }, [operatorComparison]);

  const foodPieData = useMemo(() => {
    if (!foodDistribution) return [];
    return foodDistribution.items
      .map((item) => ({
        name: item.itemName,
        value: safeNumber(item.aiCount) + safeNumber(item.manualCount),
        category: item.category,
      }))
      .filter((d) => d.value > 0);
  }, [foodDistribution]);

  const tableRows = useMemo(() => {
    const hasSubItems = foodDistribution?.items.some(
      (item) => !BASE_CATEGORIES.includes(item.itemName.toLowerCase())
    );
    if (hasSubItems && foodDistribution) {
      const evidenceByCategory = new Map(
        (comparison?.categories ?? []).map((c) => [c.category, c.evidence])
      );
      return foodDistribution.items.map((item) => ({
        key: `${item.category}-${item.itemName}`,
        label: item.itemName,
        category: item.category,
        manualCount: item.manualCount,
        manualWeightG: item.manualWeightG,
        aiCount: item.aiCount,
        aiWeightG: item.aiWeightG,
        match: item.manualCount === item.aiCount,
        evidence: evidenceByCategory.get(item.category) ?? [],
        isSubItem: true,
      }));
    }
    return (comparison?.categories ?? []).map((c) => ({
      key: c.category,
      label: c.category,
      category: c.category,
      manualCount: c.manualCount,
      manualWeightG: c.manualWeightG,
      aiCount: c.aiCount,
      aiWeightG: c.aiWeightG,
      match: c.match,
      evidence: c.evidence,
      isSubItem: false,
    }));
  }, [foodDistribution, comparison]);

  const totalWeightG = safeNumber(summary?.totals.total_g);
  const riceG = safeNumber(summary?.totals.rice_g);
  const beansG = safeNumber(summary?.totals.beans_g);
  const othersG = safeNumber(summary?.totals.others_g);

  function openEvidence(category: string, evidence: ComparisonEvidence[]) {
    setEvidenceCategory(category);
    setEvidenceItems(evidence);
    setEvidenceOpen(true);
  }

  return (
    <DashboardRoot>
      <PageTitle>Dashboard</PageTitle>
      <PageSubtitle>
        Análise das detecções da IA e comparação com registros da equipe.
      </PageSubtitle>

      {isCoordinator && summary?.teamName && (
        <TeamContextLabel>
          <span className="material-symbols-outlined">groups</span>
          Equipe: {summary.teamName}
        </TeamContextLabel>
      )}

      {isAdmin && (
        <TeamTabs teams={teams} selectedId={teamId} onSelect={setTeamId} />
      )}

      <ErrorBoundary>
        <MetricsGrid>
          <MetricCard
            label="Peso total (g)"
            icon="scale"
            value={totalWeightG.toFixed(0)}
            hint="Acumulado pela IA"
          />
          <MetricCard
            label="Arroz"
            icon="rice_bowl"
            value={`${riceG.toFixed(0)} g`}
            hint={`${(safeNumber(summary?.countsByCategory.find((c) => c.category === "arroz")?.count)).toFixed(0)} itens`}
          />
          <MetricCard
            label="Feijão"
            icon="grain"
            value={`${beansG.toFixed(0)} g`}
            hint={`${(safeNumber(summary?.countsByCategory.find((c) => c.category === "feijao")?.count)).toFixed(0)} itens`}
          />
          <MetricCard
            label="Outros"
            icon="category"
            value={`${othersG.toFixed(0)} g`}
            hint={`${(safeNumber(summary?.countsByCategory.find((c) => c.category === "outros")?.count)).toFixed(0)} itens`}
          />
        </MetricsGrid>

        <ChartsGrid>
          <GlassPanel>
            <ChartPanel>
              <ChartTitle>Peso total por categoria (g)</ChartTitle>
              <ResponsiveContainer width="100%" height={280}>
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
              <ChartTitle>Distribuição por alimento</ChartTitle>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={foodPieData.length > 0 ? foodPieData : pieData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={90}
                    label={({ name }) => name}
                  >
                    {(foodPieData.length > 0 ? foodPieData : pieData).map((_, i) => (
                      <Cell key={i} fill={FOOD_COLORS[i % FOOD_COLORS.length]} />
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
              <ResponsiveContainer width="100%" height={280}>
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

          <GlassPanel>
            <ChartPanel>
              <ChartTitle>Equipe × IA por operador (g)</ChartTitle>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={operatorChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={palette.neutral.outlineVariant} />
                  <XAxis dataKey="name" stroke={palette.neutral.onSurfaceVariant} />
                  <YAxis stroke={palette.neutral.onSurfaceVariant} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="manual" name="Equipe" fill={CATEGORY_COLORS[1]} />
                  <Bar dataKey="ai" name="IA" fill={CATEGORY_COLORS[0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartPanel>
          </GlassPanel>

        </ChartsGrid>

        {isAdmin && (
          <GlassPanel sx={{ marginBottom: 3 }}>
            <ChartPanel>
              <ChartTitle>Comparação entre equipes (g por categoria)</ChartTitle>
              <ResponsiveContainer width="100%" height={280}>
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

        <SectionHeader>Equipe × IA — Comparação por Categoria</SectionHeader>
        <GlassPanel>
          <ComparisonTable>
            <ComparisonHeaderRow>
              <div>Categoria</div>
              <div>Equipe (qtd)</div>
              <div>Equipe (peso)</div>
              <div>IA (qtd)</div>
              <div>IA (peso g)</div>
              <div>Status</div>
              <div>Evidência</div>
            </ComparisonHeaderRow>
            {tableRows.length === 0 ? (
              <ComparisonRow>
                <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 12 }}>
                  Sem dados comparativos disponíveis.
                </div>
              </ComparisonRow>
            ) : (
              tableRows.map((row) => (
                <ComparisonRow key={row.key} mismatch={!row.match}>
                  <div style={{ textTransform: "capitalize" }}>
                    {row.isSubItem && (
                      <span
                        style={{
                          fontSize: 10,
                          color: palette.neutral.onSurfaceVariant,
                          marginRight: 4,
                        }}
                      >
                        [{row.category}]
                      </span>
                    )}
                    {row.label}
                  </div>
                  <div>{safeNumber(row.manualCount)}</div>
                  <div>{safeNumber(row.manualWeightG).toFixed(1)}</div>
                  <div>{safeNumber(row.aiCount)}</div>
                  <div>{safeNumber(row.aiWeightG).toFixed(0)}</div>
                  <div>
                    <StatusPill ok={row.match}>
                      {row.match ? "Match" : "Divergência"}
                    </StatusPill>
                  </div>
                  <div>
                    {row.evidence.length > 0 && (
                      <EvidenceButton onClick={() => openEvidence(row.key, row.evidence)}>
                        Ver evidência
                      </EvidenceButton>
                    )}
                  </div>
                </ComparisonRow>
              ))
            )}
          </ComparisonTable>
        </GlassPanel>
      </ErrorBoundary>

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
