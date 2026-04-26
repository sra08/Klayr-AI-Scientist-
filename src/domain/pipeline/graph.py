from langgraph.graph import StateGraph, END
from src.domain.pipeline.state import PipelineState
from src.domain.ports.llm_client import ILLMClient
from src.domain.ports.lit_search import ILitSearch
from src.domain.prompts import (
    hypothesis_prompt, literature_prompt, protocol_prompt,
    materials_prompt, budget_prompt, timeline_prompt, validation_prompt
)
from src.domain.parsers.output_parser import (
    parse_hypothesis, parse_literature, parse_protocol,
    parse_materials, parse_budget, parse_timeline, parse_validation
)

def build_pipeline(llm: ILLMClient, lit_search: ILitSearch) -> StateGraph:

    async def refine_hypothesis(state: PipelineState) -> PipelineState:
        prompt = hypothesis_prompt.build(state["raw_input"])
        raw = await llm.complete(system=hypothesis_prompt.SYSTEM, prompt=prompt)
        state["refined_hypothesis"] = parse_hypothesis(raw)
        return state

    async def run_literature_qc(state: PipelineState) -> PipelineState:
        papers = await lit_search.search(state["refined_hypothesis"])
        prompt = literature_prompt.build(state["refined_hypothesis"], papers)
        raw = await llm.complete(system=literature_prompt.SYSTEM, prompt=prompt)
        lit_res = parse_literature(raw)
        lit_res.references = papers  # Attach the actual papers found
        state["literature_result"] = lit_res
        return state

    async def generate_protocol(state: PipelineState) -> PipelineState:
        prompt = protocol_prompt.build(
            state["refined_hypothesis"],
            state["literature_result"],
            state["few_shot_examples"]
        )
        raw = await llm.complete(system=protocol_prompt.SYSTEM, prompt=prompt)
        state["protocol_steps"] = parse_protocol(raw)
        return state

    async def generate_materials(state: PipelineState) -> PipelineState:
        prompt = materials_prompt.build(state["protocol_steps"], state["few_shot_examples"])
        raw = await llm.complete(system=materials_prompt.SYSTEM, prompt=prompt)
        state["materials"] = parse_materials(raw)
        return state

    async def generate_budget(state: PipelineState) -> PipelineState:
        prompt = budget_prompt.build(state["materials"], state["few_shot_examples"])
        raw = await llm.complete(system=budget_prompt.SYSTEM, prompt=prompt)
        state["budget"] = parse_budget(raw)
        return state

    async def generate_timeline(state: PipelineState) -> PipelineState:
        prompt = timeline_prompt.build(state["protocol_steps"], state["budget"])
        raw = await llm.complete(system=timeline_prompt.SYSTEM, prompt=prompt)
        state["timeline"] = parse_timeline(raw)
        return state

    async def generate_validation(state: PipelineState) -> PipelineState:
        prompt = validation_prompt.build(
            state["refined_hypothesis"],
            state["protocol_steps"],
            state["few_shot_examples"]
        )
        raw = await llm.complete(system=validation_prompt.SYSTEM, prompt=prompt)
        state["validation"] = parse_validation(raw)
        return state

    graph = StateGraph(PipelineState)
    graph.add_node("refine_hypothesis", refine_hypothesis)
    graph.add_node("literature_qc", run_literature_qc)
    graph.add_node("generate_protocol", generate_protocol)
    graph.add_node("generate_materials", generate_materials)
    graph.add_node("generate_budget", generate_budget)
    graph.add_node("generate_timeline", generate_timeline)
    graph.add_node("generate_validation", generate_validation)

    graph.set_entry_point("refine_hypothesis")
    graph.add_edge("refine_hypothesis", "literature_qc")
    graph.add_edge("literature_qc", "generate_protocol")
    graph.add_edge("generate_protocol", "generate_materials")
    graph.add_edge("generate_materials", "generate_budget")
    graph.add_edge("generate_budget", "generate_timeline")
    graph.add_edge("generate_timeline", "generate_validation")
    graph.add_edge("generate_validation", END)

    return graph.compile()
