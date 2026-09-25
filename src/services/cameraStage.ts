import type { BodyCalibration, CameraStageState, CameraStageTarget, DualPalmState } from '../types';
import { mapHeightToNote, mapSeparationToFigure } from '../data/musicalScaleData';
import { isValidBodyCalibration, musicalOpeningToRaw, musicalYToRaw } from './bodyCalibration';

export function deriveCameraStageState(
  rawState: DualPalmState,
  musicalState: DualPalmState,
  target: CameraStageTarget | null,
  calibration: BodyCalibration | null,
): CameraStageState {
  const hasTracking = Boolean(rawState.leftPalm?.present && rawState.rightPalm?.present);
  const rawAverageY = hasTracking ? (rawState.leftPalm!.center.y + rawState.rightPalm!.center.y) / 2 : null;
  const currentMusicalY = hasTracking ? (musicalState.leftPalm!.center.y + musicalState.rightPalm!.center.y) / 2 : null;
  const note = currentMusicalY === null ? null : mapHeightToNote(currentMusicalY);
  const figure = hasTracking ? mapSeparationToFigure(musicalState.distanceCm) : null;
  const calibrationActive = isValidBodyCalibration(calibration);
  return {
    hasTracking,
    trackingPaused: !hasTracking,
    rawAverageY,
    currentMusicalY,
    currentOpening: hasTracking ? musicalState.distanceCm : null,
    currentNoteId: note?.id ?? null,
    currentNoteLabel: note?.octaveName ?? null,
    currentFigureId: figure?.id ?? null,
    currentFigureLabel: figure?.name ?? null,
    currentFigureSymbol: figure?.symbol ?? null,
    target,
    targetRawY: target?.targetYNorm === undefined ? null : musicalYToRaw(target.targetYNorm, calibrationActive ? calibration : null),
    targetRawOpening: target?.targetOpening === undefined ? null : musicalOpeningToRaw(target.targetOpening, calibrationActive ? calibration : null),
    aligned: Boolean(target?.matched && hasTracking),
    calibrationActive,
  };
}
