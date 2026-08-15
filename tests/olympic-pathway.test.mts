import assert from "node:assert/strict";
import test from "node:test";
import { analyzeOlympicPathway, validatePathwayInput, type ComparableSource, type PathwayInput } from "../src/lib/olympic-pathway/core.ts";

const input:PathwayInput={event:1500,performance:"4:32.8",ageYears:13,ageMonths:4,gender:"F",representedCountry:"BR",performanceDate:"2026-07-12",context:"official",surface:"outdoor"};
const source:ComparableSource={key:"NO",label:"Noruega",country:"NO",category:"13 anos",alignment:"exact_age",sourceUrl:"https://example.com",status:"available",performancesMs:Array.from({length:100},(_,index)=>250000+index*3000)};

test("valida tempo, idade, categoria e data",()=>{assert.equal(validatePathwayInput(input).valid,true);assert.equal(validatePathwayInput({...input,performance:"3:75"}).valid,false);assert.equal(validatePathwayInput({...input,ageYears:8}).valid,false);});
test("calcula posição hipotética e compatibilidade sem chamar de probabilidade",()=>{const result=analyzeOlympicPathway(input,[source],"2026-08-15T12:00:00.000Z");assert.equal(result.comparisons[0].position,9);assert.equal(result.compatibility,92);assert.equal(result.probabilityCalibrated,false);assert.equal(result.confidence,"baixa");});
test("não produz zero por ausência de dados",()=>{const unavailable={...source,status:"unavailable" as const,performancesMs:[]};const result=analyzeOlympicPathway(input,[unavailable]);assert.equal(result.compatibility,null);assert.equal(result.comparableSources,0);});
test("não inventa posição além da lista disponível",()=>{const result=analyzeOlympicPathway({...input,performance:"20:00"},[source]);assert.equal(result.comparisons[0].position,null);assert.equal(result.comparisons[0].beyondAvailableList,true);});
test("3.000 m abre rotas de 1.500 m e 5.000 m",()=>{const result=analyzeOlympicPathway({...input,event:3000,performance:"10:00"},[source]);assert.deepEqual(result.threeKRoutes.map(route=>route.distance),[1500,5000]);assert.ok(result.threeKRoutes.every(route=>Number.isFinite(route.divergencePercent)));});
