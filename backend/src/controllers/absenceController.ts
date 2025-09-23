import { PrismaClient } from "@prisma/client"
import type { Request, Response } from "express"
import { users } from "../../data/users.js"

const prisma = new PrismaClient()

// Normalisoi tilateksti (ääkköset, välilyönnit, yhdistelmämerkit)
const normalize = (s: any) =>
  String(s ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .normalize("NFC")

// Hyväksytyt tilat (map ilman ääkkösiä -> kanoninen arvo)
const STATUS_MAP = {
  hyvaksytty: "hyväksytty",
  hylatty: "hylätty",
  palautettu: "palautettu",
} as const

const hasOverlappingApprovedAbsence = async (
  employeeId: string,
  startDate: Date,
  endDate: Date,
  excludeId?: string,
) => {
  const overlapping = await prisma.absence.findMany({
    where: {
      employeeId: String(employeeId).trim(),
      status: "hyväksytty",
      AND: [
        {
          startDate: {
            lte: endDate, // existing absence starts before or on the new end date
          },
        },
        {
          endDate: {
            gte: startDate, // existing absence ends after or on the new start date
          },
        },
      ],
      ...(excludeId && { NOT: { id: excludeId } }), // exclude specific absence when updating
    },
  })

  return overlapping.length > 0
}

export const createAbsence = async (req: Request, res: Response) => {
  try {
    const { employeeName, employeeId, startDate, endDate, reason } = req.body ?? {}

    if (!employeeName || !employeeId || !startDate || !endDate || !reason) {
      return res.status(400).json({ error: "Pakollisia kenttiä puuttuu" })
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({ error: "Virheellinen päivämäärä" })
    }

    const hasOverlap = await hasOverlappingApprovedAbsence(employeeId, start, end)
    if (hasOverlap) {
      return res.status(400).json({
        error:
          "Sinulla on jo hyväksytty poissaolo kyseiselle ajanjaksolle. Päällekkäiset poissaolot eivät ole sallittuja.",
      })
    }

    // Loma/saldovapaa -> odottaa, muut -> hyväksytty
    let status: "odottaa" | "hyväksytty" = "odottaa"
    if (reason !== "loma" && reason !== "saldovapaa") status = "hyväksytty"

    // Hae esihenkilö käyttäjätiedosta
    const employee = users.find((u) => u.id === employeeId)
    const esihenkiloId = employee?.esihenkiloId ?? null

    const newAbsence = await prisma.absence.create({
      data: {
        employeeName: String(employeeName).trim(),
        employeeId: String(employeeId).trim(),
        startDate: start,
        endDate: end,
        reason: String(reason).trim(),
        status,
        esihenkiloId, // backend asettaa automaattisesti
      },
    })

    return res.status(201).json(newAbsence)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Poissaolon luonti epäonnistui" })
  }
}

export const getAbsences = async (_req: Request, res: Response) => {
  try {
    const absences = await prisma.absence.findMany({
      orderBy: { createdAt: "desc" },
    })
    return res.status(200).json(absences)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Poissaolojen haku epäonnistui" })
  }
}

export const updateAbsenceStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const rawStatus = (req.body as { status?: string }).status

    const key = normalize(rawStatus)
    const canonical = (STATUS_MAP as Record<string, string>)[key]
    if (!canonical) {
      return res.status(400).json({ error: "Virheellinen tila" })
    }

    const updatedAbsence = await prisma.absence
      .update({
        where: { id },
        data: { status: canonical },
      })
      .catch(() => null)

    if (!updatedAbsence) {
      return res.status(404).json({ error: "Poissaoloa ei löytynyt annetulla id:llä" })
    }

    return res.status(200).json(updatedAbsence)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Tilan päivitys epäonnistui" })
  }
}