import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVolumeUp, faVolumeMute } from "@fortawesome/free-solid-svg-icons";
import "./DataCharts.css";
import "../../common.css";
import {
  FEATURE_CODE_SCOTLAND,
  getPlaceNameByFeatureCode,
  getPhoneticPlaceNameByFeatureCode,
} from "../Utils/CsvUtils";
import {
  playAudio,
  isAudioPlaying,
  addPlayStateChangeListener,
  deletePlayStateChangeListener,
} from "../Utils/Sonification";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import { Tooltip as ReactBootstrapTooltip } from "react-bootstrap";
import "../ToolTips/ToolTip.css";

const SonificationPlayButton = ({
  seriesData = null,
  seriesTitle = "No data",
  regionCode = null,
  dateRange = null,
}) => {
  const [audioPlaying, setAudioPlaying] = useState(false);

  useEffect(() => {
    const listener = () => setAudioPlaying(isAudioPlaying());
    addPlayStateChangeListener(listener);

    return function cleanup() {
      deletePlayStateChangeListener(listener);
    };
  }, []);

  function handleAudio() {
    if (seriesData !== null && seriesData.length > 0) {
      playAudio(
        seriesTitle,
        seriesData,
        dateRange,
        getPhoneticPlaceNameByFeatureCode(
          regionCode === null ? FEATURE_CODE_SCOTLAND : regionCode
        )
      );
    }
  }

  function createTitle() {
    return audioPlaying
      ? "Stop listening"
      : "Listen to audio representation of " +
          seriesTitle.toLowerCase() +
          " for " +
          getPlaceNameByFeatureCode(
            regionCode === null ? FEATURE_CODE_SCOTLAND : regionCode
          );
  }

  return (
    <OverlayTrigger
      overlay={
        <ReactBootstrapTooltip id="tooltip">
          {createTitle()}
        </ReactBootstrapTooltip>
      }
    >
      <button
        type="button"
        className="sonification-play-button"
        onClick={handleAudio}
        aria-label={createTitle()}
      >
        <span>
          <FontAwesomeIcon
            icon={audioPlaying ? faVolumeMute : faVolumeUp}
            size="2x"
            color="#6c6c6c"
          />
          <h5>{audioPlaying ? "Stop" : "Listen"}</h5>
        </span>
      </button>
    </OverlayTrigger>
  );
};

export default SonificationPlayButton;
