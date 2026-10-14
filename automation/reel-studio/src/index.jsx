// Remotion entry: one composition per kit. Length and props come from public/<id>/props.json (written by prep.mjs).
import React from 'react';
import { registerRoot, Composition } from 'remotion';
import { Yap } from './Yap.jsx';
import { StudioBeat } from './StudioBeat.jsx';

const calculateMetadata = ({ props }) => ({ durationInFrames: Math.ceil(props.duration * props.fps), fps: props.fps, props });
const defaults = { duration: 5, fps: 30, video: '', words: [], emphasis: [], cuts: [0] };

const Root = () => (
  <>
    <Composition id="Yap" component={Yap} width={1080} height={1920} fps={30} durationInFrames={150} defaultProps={defaults} calculateMetadata={calculateMetadata} />
    <Composition id="StudioBeat" component={StudioBeat} width={1080} height={1920} fps={30} durationInFrames={150} />
  </>
);
registerRoot(Root);
