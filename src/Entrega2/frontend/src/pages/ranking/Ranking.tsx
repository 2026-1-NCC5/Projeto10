import { useEffect, useMemo, useState } from "react"
import Fade from "@mui/material/Fade"

import { useAuth } from "../../contexts/AuthContext"
import * as api from "../../services/api"
import type { RankingItem } from "../../services/api"
import { formatKg } from "../../utils/units"
import {
  RankingRoot,
  PageTitle,
  PageSubtitle,
  ContentGrid,
  PodiumWrapper,
  PodiumCard,
  PodiumBadge,
  PodiumTeamName,
  PodiumWeight,
  PodiumHint,
  ListSection,
  ListHeader,
  ListTitle,
  ListRow,
  RankBadge,
  TeamCell,
  TeamName,
  TeamSubtle,
  WeightCell,
  Pagination,
  PageButton,
  PageIndicator,
  EmptyState,
} from "./styles"


const PAGE_SIZE = 10


function RankingPage() {
  const { token } = useAuth()
  const [items, setItems] = useState<RankingItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [topThree, setTopThree] = useState<RankingItem[]>([])

  useEffect(() => {
    if (!token) return
    let cancelled = false
    setLoading(true)
    api
      .getRanking(token, PAGE_SIZE, (page - 1) * PAGE_SIZE)
      .then((res) => {
        if (cancelled) return
        setItems(res.items)
        setTotal(res.total)
      })
      .catch(() => {
        if (!cancelled) setItems([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [token, page])

  useEffect(() => {
    if (!token) return
    let cancelled = false
    api
      .getRanking(token, 3, 0)
      .then((res) => {
        if (!cancelled) setTopThree(res.items)
      })
      .catch(() => {
        if (!cancelled) setTopThree([])
      })
    return () => {
      cancelled = true
    }
  }, [token])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const canPrev = page > 1
  const canNext = page < totalPages

  const podiumOrder = useMemo(() => {
    const [first, second, third] = topThree
    return { first, second, third }
  }, [topThree])

  return (
    <RankingRoot>
      <PageTitle>Ranking</PageTitle>
      <PageSubtitle>Equipes por peso arrecadado — valores validados pela IA.</PageSubtitle>

      <ContentGrid>
        <PodiumWrapper>
          {podiumOrder.second ? (
            <PodiumCard place={2}>
              <PodiumBadge place={2}>2º</PodiumBadge>
              <PodiumTeamName>{podiumOrder.second.teamName}</PodiumTeamName>
              <PodiumWeight>{formatKg(podiumOrder.second.totalG)} kg</PodiumWeight>
              <PodiumHint>{podiumOrder.second.detectionCount} detecções</PodiumHint>
            </PodiumCard>
          ) : (
            <PodiumCard place={2}>
              <PodiumBadge place={2}>2º</PodiumBadge>
              <PodiumHint>—</PodiumHint>
            </PodiumCard>
          )}
          {podiumOrder.first ? (
            <PodiumCard place={1}>
              <span className="material-symbols-outlined" style={{ fontSize: 32, color: "#FFD66B" }}>
                emoji_events
              </span>
              <PodiumBadge place={1}>1º</PodiumBadge>
              <PodiumTeamName>{podiumOrder.first.teamName}</PodiumTeamName>
              <PodiumWeight>{formatKg(podiumOrder.first.totalG)} kg</PodiumWeight>
              <PodiumHint>{podiumOrder.first.detectionCount} detecções</PodiumHint>
            </PodiumCard>
          ) : (
            <PodiumCard place={1}>
              <PodiumBadge place={1}>1º</PodiumBadge>
              <PodiumHint>—</PodiumHint>
            </PodiumCard>
          )}
          {podiumOrder.third ? (
            <PodiumCard place={3}>
              <PodiumBadge place={3}>3º</PodiumBadge>
              <PodiumTeamName>{podiumOrder.third.teamName}</PodiumTeamName>
              <PodiumWeight>{formatKg(podiumOrder.third.totalG)} kg</PodiumWeight>
              <PodiumHint>{podiumOrder.third.detectionCount} detecções</PodiumHint>
            </PodiumCard>
          ) : (
            <PodiumCard place={3}>
              <PodiumBadge place={3}>3º</PodiumBadge>
              <PodiumHint>—</PodiumHint>
            </PodiumCard>
          )}
        </PodiumWrapper>

        <ListSection>
          <ListHeader>
            <ListTitle>Classificação geral</ListTitle>
          </ListHeader>

          <Fade in={!loading} timeout={250} key={page}>
            <div>
              {items.length === 0 && !loading ? (
                <EmptyState>Nenhuma equipe encontrada.</EmptyState>
              ) : (
                items.map((item) => (
                  <ListRow key={item.teamId} sx={{ marginBottom: 1.5 }}>
                    <RankBadge>{item.rank}º</RankBadge>
                    <TeamCell>
                      <TeamName>{item.teamName}</TeamName>
                      <TeamSubtle>{item.detectionCount} detecções</TeamSubtle>
                    </TeamCell>
                    <WeightCell>{formatKg(item.totalG)} kg</WeightCell>
                  </ListRow>
                ))
              )}
            </div>
          </Fade>

          <Pagination>
            <PageButton
              onClick={() => canPrev && setPage((p) => p - 1)}
              disabled={!canPrev}
              aria-label="Página anterior"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </PageButton>
            <PageIndicator>
              Página {page} de {totalPages}
            </PageIndicator>
            <PageButton
              onClick={() => canNext && setPage((p) => p + 1)}
              disabled={!canNext}
              aria-label="Próxima página"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </PageButton>
          </Pagination>
        </ListSection>
      </ContentGrid>
    </RankingRoot>
  )
}


export default RankingPage
