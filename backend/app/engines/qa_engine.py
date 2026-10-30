import re
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session
from app.models.regulation import Clause
from app.core.config import settings


class RegulatoryQaEngine:
    @staticmethod
    def search_clauses(
        db: Session,
        query: str,
        limit: int = 5,
    ) -> List[Dict[str, Any]]:
        # Extract potential clause numbers like 1.8, 1.8(g), 2.24
        clause_mentions = [m.lower() for m in re.findall(r"\d+\.\d+(?:\([a-zA-Z0-9]+\))?", query)]
        terms = [t.lower() for t in re.findall(r"[A-Za-z0-9]+", query) if len(t) > 2]
        all_clauses = db.query(Clause).filter(Clause.is_active == True).all()

        scored = []
        for clause in all_clauses:
            text = f"{clause.clause_number} {clause.title} {clause.content}".lower()
            score = 0.0
            
            # Direct clause mention match (highest weight)
            for cm in clause_mentions:
                if cm in clause.clause_number.lower():
                    score += 10.0
                    # Exact subclause match boost
                    if cm == clause.clause_number.lower().replace("clause ", "").strip():
                        score += 15.0

            # Match exact clause number in terms
            if any(term in clause.clause_number.lower() for term in terms):
                score += 3.0
            # Match terms in title
            for t in terms:
                if t in clause.title.lower():
                    score += 2.0
                if t in text:
                    score += 0.5

            if score > 0:
                scored.append((score, clause))

        scored.sort(key=lambda x: x[0], reverse=True)
        results = []
        for score, clause in scored[:limit]:
            results.append({
                "clause_id": clause.id,
                "clause_number": clause.clause_number,
                "title": clause.title,
                "content": clause.content,
                "summary": clause.summary,
                "score": round(score, 2),
            })
        return results

    @staticmethod
    def answer_regulatory_question(
        db: Session,
        query: str,
    ) -> Dict[str, Any]:
        retrieved = RegulatoryQaEngine.search_clauses(db, query, limit=4)

        # Honest abstention check
        if not retrieved or retrieved[0]["score"] < 1.0:
            return {
                "query": query,
                "answer": "I cannot answer this question because no relevant AICTE Approval Process Handbook clauses or statutory regulations were found in the active regulatory corpus. The system will not generate ungrounded regulatory advice.",
                "citations": [],
                "confidence": 0.0,
                "abstained": True,
                "reason": "Insufficient grounded evidence in regulatory database.",
            }

        top_match = retrieved[0]
        citations = [
            {
                "clause_number": c["clause_number"],
                "title": c["title"],
                "score": c["score"],
                "excerpt": c["content"][:200] + "...",
            }
            for c in retrieved
        ]

        # Deterministic grounded synthesis
        answer = (
            f"According to **{top_match['clause_number']} ({top_match['title']})** of the AICTE Approval Process Handbook (2024–2027):\n\n"
            f"> {top_match['content']}\n\n"
            f"**Official Citation:** Refer to {top_match['clause_number']}. "
            f"Any administrative action or compliance must be validated against the formal handbook provision."
        )

        return {
            "query": query,
            "answer": answer,
            "citations": citations,
            "confidence": min(1.0, top_match["score"] / 5.0),
            "abstained": False,
            "reason": None,
        }
