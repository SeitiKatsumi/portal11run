import assert from "node:assert/strict";
import test from "node:test";
import { calculateFormulaResult, calculateRiegelProjection, calculateVDOT, parseDuration, solveEquivalentVDOTTime } from "../src/lib/running-formulas/index.ts";

test("interpreta durações válidas e rejeita entradas inválidas",()=>{assert.equal(parseDuration("3:45"),225);assert.equal(parseDuration("00:03:45"),225);assert.equal(parseDuration("1:05:30"),3930);assert.equal(parseDuration("10:00.5"),600.5);for(const value of ["","0:00","3:75","-3:45","abc"])assert.equal(parseDuration(value),null);});
test("calcula ritmo, velocidade e VDOT de 3.000 m em 10:00",()=>{const result=calculateFormulaResult({distanceM:3000,durationSec:600,riegelExponent:1.06});assert.equal(result.paceSecKm,200);assert.equal(result.speedKmh,18);assert.ok(Math.abs(result.vdot-58.8492)<.001);assert.ok(result.zones.every(z=>z.fastPace<z.slowPace));});
test("projeta pelo modelo Riegel",()=>{assert.ok(Math.abs(calculateRiegelProjection(3000,600,5000)-1031.1)<.2);assert.ok(Math.abs(calculateRiegelProjection(3000,600,10000)-2149.8)<.2);});
test("resolve equivalências VDOT e termina sem NaN",()=>{const vdot=calculateVDOT(3000,600);const five=solveEquivalentVDOTTime(5000,vdot);const ten=solveEquivalentVDOTTime(10000,vdot);assert.ok(Math.abs(five-1040)<1);assert.ok(Math.abs(ten-2157.2)<1);assert.ok(Number.isFinite(five)&&Number.isFinite(ten));});
