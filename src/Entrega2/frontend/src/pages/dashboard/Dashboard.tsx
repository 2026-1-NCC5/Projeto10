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
import { formatCurrencyBrl, formatKg, gramsToKg } from "../../utils/units";
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
      weight: Number(gramsToKg(c.totalWeightG).toFixed(2)),
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
      weight: Number(gramsToKg(p.totalWeightG).toFixed(2)),
    }));
  }, [summary]);

  const allTeamsData = useMemo(() => {
    if (!allSummary) return [];
    return allSummary.teams.map((t) => {
      const row: Record<string, string | number> = { name: t.teamName };
      t.byCategory.forEach((c) => {
        row[c.category] = Number(gramsToKg(c.totalWeightG).toFixed(2));
      });
      return row;
    });
  }, [allSummary]);

  const operatorChartData = useMemo(() => {
    if (!operatorComparison) return [];
    return operatorComparison.operators.map((o) => ({
      name: o.operatorName,
      manual: Number(gramsToKg(o.manualWeightG).toFixed(2)),
      ai: Number(gramsToKg(o.aiWeightG).toFixed(2)),
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
        aiPriceBrl: item.aiPriceBrl ?? 0,
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
      aiPriceBrl: c.aiPriceBrl ?? 0,
      match: c.match,
      evidence: c.evidence,
      isSubItem: false,
    }));
  }, [foodDistribution, comparison]);

  const totalWeightG = safeNumber(summary?.totals.total_g);
  const riceG = safeNumber(summary?.totals.rice_g);
  const beansG = safeNumber(summary?.totals.beans_g);
  const othersG = safeNumber(summary?.totals.others_g);
  const totalBrl = safeNumber(summary?.totals.total_brl);

  const revenueByCategory = useMemo(() => {
    if (!summary) return [];
    return summary.countsByCategory.map((c) => ({
      name: c.category,
      value: Number((c.totalPriceBrl ?? 0).toFixed(2)),
    }));
  }, [summary]);

  const revenueThisMonth = useMemo(() => {
    if (!summary) return 0;
    const cutoff = new Date();
    cutoff.setDate(1);
    const prefix = cutoff.toISOString().slice(0, 7);
    return summary.timeseries
      .filter((p) => p.date.startsWith(prefix))
      .reduce((acc, p) => acc + safeNumber(p.totalPriceBrl), 0);
  }, [summary]);

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
            label="Peso total (kg)"
            icon="scale"
            value={formatKg(totalWeightG)}
            hint="Acumulado pela IA"
          />
          <MetricCard
            label="Arroz"
            icon="rice_bowl"
            value={`${formatKg(riceG)} kg`}
            hint={`${(safeNumber(summary?.countsByCategory.find((c) => c.category === "arroz")?.count)).toFixed(0)} itens`}
          />
          <MetricCard
            label="Feijão"
            icon="grain"
            value={`${formatKg(beansG)} kg`}
            hint={`${(safeNumber(summary?.countsByCategory.find((c) => c.category === "feijao")?.count)).toFixed(0)} itens`}
          />
          <MetricCard
            label="Outros"
            icon="category"
            value={`${formatKg(othersG)} kg`}
            hint={`${(safeNumber(summary?.countsByCategory.find((c) => c.category === "outros")?.count)).toFixed(0)} itens`}
          />
        </MetricsGrid>

        <MetricsGrid>
          <MetricCard
            label="Receita total (R$)"
            icon="payments"
            value={formatCurrencyBrl(totalBrl)}
            hint="Estimada pela IA"
          />
          <MetricCard
            label="Preço médio (R$/kg)"
            icon="local_offer"
            value={totalWeightG > 0 ? formatCurrencyBrl(totalBrl / (totalWeightG / 1000)) : "—"}
            hint="Média ponderada"
          />
          <MetricCard
            label="Receita do mês"
            icon="calendar_month"
            value={formatCurrencyBrl(revenueThisMonth)}
            hint="Mês atual"
          />
        </MetricsGrid>

        <ChartsGrid>
          <GlassPanel>
            <ChartPanel>
              <ChartTitle>Peso total por categoria (kg)</ChartTitle>
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
              <ChartTitle>Peso total ao longo do tempo (kg)</ChartTitle>
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
              <ChartTitle>Equipe × IA por operador (kg)</ChartTitle>
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

          <GlassPanel>
            <ChartPanel>
              <ChartTitle>Receita estimada por categoria (R$)</ChartTitle>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={revenueByCategory}>
                  <CartesianGrid strokeDasharray="3 3" stroke={palette.neutral.outlineVariant} />
                  <XAxis dataKey="name" stroke={palette.neutral.onSurfaceVariant} />
                  <YAxis stroke={palette.neutral.onSurfaceVariant} tickFormatter={(v) => `R$${v}`} />
                  <Tooltip formatter={(v) => [`R$ ${Number(v ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, "Receita"]} />
                  <Bar dataKey="value" fill={palette.tertiary.main} />
                </BarChart>
              </ResponsiveContainer>
            </ChartPanel>
          </GlassPanel>

        </ChartsGrid>

        {isAdmin && (
          <GlassPanel sx={{ marginBottom: 3 }}>
            <ChartPanel>
              <ChartTitle>Comparação entre equipes (kg por categoria)</ChartTitle>
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
              <div>Equipe (kg)</div>
              <div>IA (qtd)</div>
              <div>IA (kg)</div>
              <div>Valor IA (R$)</div>
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
                  <div>{formatKg(row.manualWeightG)}</div>
                  <div>{safeNumber(row.aiCount)}</div>
                  <div>{formatKg(row.aiWeightG)}</div>
                  <div>{formatCurrencyBrl(row.aiPriceBrl)}</div>
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
