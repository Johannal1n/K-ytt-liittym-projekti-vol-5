"use client"


import type React from "react"

import { useState } from "react"

const AbsenceForm = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}")

  const [formData, setFormData] = useState({
    employeeName: `${user.etunimi} ${user.sukunimi}`, // ✅ Template string oikein
    employeeId: user.id,
    reason: "",
    startDate: "",
    endDate: "",
  })


  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (error) setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch("http://localhost:3001/api/absences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Virhe lomakkeen lähetyksessä")
        return
      }

      console.log("Vastaus backendiltä:", data)
      alert("Poissaolohakemus lähetetty!")
      setFormData({
        ...formData,
        reason: "",
        startDate: "",
        endDate: "",
      })
    } catch (error) {
      console.error("Virhe:", error)
      setError("Lähetys epäonnistui. Tarkista verkkoyhteytesi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <button
        onClick={() => {
          localStorage.removeItem("user")
          window.location.href = "/"
        }}
        className="mb-4 bg-red-600 text-white px-4 py-2 rounded"
      >
        Kirjaudu ulos
      </button>

      <form onSubmit={handleSubmit} className="space-y-4 border rounded p-4 bg-white shadow">
        <h2 className="text-xl font-bold">Poissaolohakemus</h2>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

        <input
          type="text"
          name="employeeName"
          value={formData.employeeName}
          className="w-full border p-2 bg-gray-100"
          disabled
        />

        <input
          type="text"
          name="employeeId"
          value={formData.employeeId}
          className="w-full border p-2 bg-gray-100"
          disabled
        />

        <select name="reason" value={formData.reason} onChange={handleChange} className="w-full border p-2" required>
          <option value="">Valitse syy</option>
          <option value="sairaus">Sairaus</option>
          <option value="loma">Loma</option>
          <option value="saldovapaa">Saldovapaa</option>
          <option value="muu">Muu</option>
        </select>

        <input
          type="date"
          name="startDate"
          value={formData.startDate}
          onChange={handleChange}
          className="w-full border p-2"
          required
        />

        <input
          type="date"
          name="endDate"
          value={formData.endDate}
          onChange={handleChange}
          className="w-full border p-2"
          required
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Lähetetään..." : "Lähetä"}
        </button>
      </form>
    </div>
  )
}

export default AbsenceForm