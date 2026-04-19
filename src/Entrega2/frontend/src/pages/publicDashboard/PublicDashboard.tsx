import { useEffect, useMemo, useState } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { useTheme } from "@mui/material/styles"

import Box from "@mui/material/Box"

import * as api from "../../services/api"
import type { PublicOverview } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import { useThemeMode } from "../../theme/ThemeModeContext"
import { formatInt, formatKg, gramsToKg } from "../../utils/units"
import BackgroundGlow from "../../components/BackgroundGlow/BackgroundGlow"
import Sidebar from "../../components/Sidebar/Sidebar"
import { SIDEBAR_WIDTH } from "../../components/Sidebar/styles"
import {
  PageRoot,
  HeaderBar,
  Brand,
  BrandBadge,
  BrandText,
  BrandTitle,
  BrandSubtitle,
  HeaderActions,
  IconButton,
  LoginLink,
  FiltersBar,
  FilterField,
  FilterLabel,
  FilterInput,
  ResetButton,
  MetricsGrid,
  MetricCard,
  MetricLabel,
  MetricValue,
  MetricHint,
  ChartsGrid,
  ChartPanel,
  ChartTitle,
  TablePanel,
  Table,
  Th,
  Td,
  TableTitle,
  LoadingBox,
} from "./styles"


const CATEGORY_LABEL: Record<string, string> = {
  arroz: "Arroz",
  feijao: "Feijão",
  outros: "Outros",
}


const SLICE_COLORS = ["#00AB72", "#57DEA0", "#4DB5F5", "#F5A623", "#9B59B6", "#E74C3C", "#1ABC9C", "#F39C12"]


function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}


function PublicDashboardPage() {
  const { mode, toggleMode } = useThemeMode()
  const { user } = useAuth()
  const isAuthenticated = user !== null
  const theme = useTheme()
  const [data, setData] = useState<PublicOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [from, setFrom] = useState<string>("")
  const [to, setTo] = useState<string>("")

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    api
      .getPublicOverview({ from: from || null, to: to || null })
      .then((d) => {
        if (!cancelled) {
          setData(d)
          setError(null)
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Erro ao carregar dados")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [from, to])

  const categoriesData = useMemo(() => {
    if (!data) return []
    return data.categories
      .filter((c) => c.totalG > 0)
      .map((c) => ({
        name: CATEGORY_LABEL[c.category] ?? capitalize(c.category),
        value: gramsToKg(c.totalG),
        count: c.count,
      }))
  }, [data])

  const timeseriesData = useMemo(() => {
    if (!data) return []
    return data.timeseries.map((p) => ({
      date: p.date,
      kg: Number(gramsToKg(p.totalG).toFixed(2)),
    }))
  }, [data])

  const topItems = useMemo(() => {
    if (!data) return []
    return data.items.slice(0, 10)
  }, [data])

  const tooltipStyle = {
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 8,
    color: theme.palette.text.primary,
  }

  const content = (
    <PageRoot>
      {!isAuthenticated && (
        <HeaderBar>
          <Brand>
            <BrandBadge>LE</BrandBadge>
            <BrandText>
              <BrandTitle>Lideranças Empáticas</BrandTitle>
              <BrandSubtitle>Panorama público de arrecadações</BrandSubtitle>
            </BrandText>
          </Brand>
          <HeaderActions>
            <IconButton onClick={toggleMode} title="Alternar tema" aria-label="Alternar tema">
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                {mode === "dark" ? "light_mode" : "dark_mode"}
              </span>
            </IconButton>
            <LoginLink href="/login">Entrar</LoginLink>
          </HeaderActions>
        </HeaderBar>
      )}

      <FiltersBar>
        <FilterField>
          <FilterLabel>Data inicial</FilterLabel>
          <FilterInput type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </FilterField>
        <FilterField>
          <FilterLabel>Data final</FilterLabel>
          <FilterInput type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </FilterField>
        <ResetButton
          onClick={() => {
            setFrom("")
            setTo("")
          }}
        >
          Limpar filtros
        </ResetButton>
      </FiltersBar>

      {loading && <LoadingBox>Carregando...</LoadingBox>}
      {error && <LoadingBox>{error}</LoadingBox>}

      {data && !loading && (
        <>
          <MetricsGrid>
            <MetricCard>
              <MetricLabel>Arrecadação total</MetricLabel>
              <MetricValue>{formatKg(data.totalCollectedG)} kg</MetricValue>
              <MetricHint>Valores baseados em análise por IA</MetricHint>
            </MetricCard>
            <MetricCard>
              <MetricLabel>Equipes ativas</MetricLabel>
              <MetricValue>{formatInt(data.collectorsCount)}</MetricValue>
              <MetricHint>
                Média por equipe:{" "}
                {data.collectorsCount > 0
                  ? `${formatKg(data.totalCollectedG / data.collectorsCount)} kg`
                  : "—"}
              </MetricHint>
            </MetricCard>
          </MetricsGrid>

          <ChartsGrid>
            <ChartPanel>
              <ChartTitle>Arrecadação por data (kg)</ChartTitle>
              {timeseriesData.length === 0 ? (
                <LoadingBox>Sem dados no período selecionado.</LoadingBox>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={timeseriesData}>
                    <defs>
                      <linearGradient id="colorKg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.6} />
                        <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis dataKey="date" stroke={theme.palette.text.secondary} fontSize={12} />
                    <YAxis stroke={theme.palette.text.secondary} fontSize={12} unit=" kg" />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value: number) => [`${value.toLocaleString("pt-BR")} kg`, "Arrecadação"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="kg"
                      stroke={theme.palette.primary.main}
                      fillOpacity={1}
                      fill="url(#colorKg)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </ChartPanel>

            <ChartPanel>
              <ChartTitle>Distribuição por categoria</ChartTitle>
              {categoriesData.length === 0 ? (
                <LoadingBox>Sem dados.</LoadingBox>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoriesData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={2}
                    >
                      {categoriesData.map((_, i) => (
                        <Cell key={i} fill={SLICE_COLORS[i % SLICE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value: number) => [`${value.toLocaleString("pt-BR")} kg`, "Total"]}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartPanel>
          </ChartsGrid>

          <TablePanel>
            <TableTitle>Itens mais arrecadados</TableTitle>
            <Table>
              <thead>
                <tr>
                  <Th>Item</Th>
                  <Th>Categoria</Th>
                  <Th style={{ textAlign: "right" }}>Quantidade</Th>
                  <Th style={{ textAlign: "right" }}>Total (kg)</Th>
                </tr>
              </thead>
              <tbody>
                {topItems.length === 0 && (
                  <tr>
                    <Td colSpan={4} style={{ textAlign: "center", padding: 24 }}>
                      Sem dados.
                    </Td>
                  </tr>
                )}
                {topItems.map((item) => (
                  <tr key={`${item.itemName}-${item.category}`}>
                    <Td>{capitalize(item.itemName)}</Td>
                    <Td>{CATEGORY_LABEL[item.category] ?? capitalize(item.category)}</Td>
                    <Td style={{ textAlign: "right" }}>{formatInt(item.count)}</Td>
                    <Td style={{ textAlign: "right" }}>{formatKg(item.totalG)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TablePanel>
        </>
      )}
    </PageRoot>
  )

  if (isAuthenticated) {
    return (
      <Box sx={{ display: "flex", minHeight: "100vh", position: "relative", overflow: "hidden" }}>
        <BackgroundGlow />
        <Sidebar />
        <Box sx={{ flex: 1, marginLeft: `${SIDEBAR_WIDTH}px`, position: "relative", zIndex: 1, overflowY: "auto" }}>
          {content}
        </Box>
      </Box>
    )
  }

  return content
}


export default PublicDashboardPage
