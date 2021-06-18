import React from 'react';
//
import { translate } from '../utils/Utils';

import useChartContext from '../hooks/useChartContext';
import useLatest from '../hooks/useLatest';

const getLineBackgroundColor = dark =>
  dark ? 'rgba(255,255,255,.3)' : 'rgba(0, 26, 39, 0.3)';

const getBackgroundColor = dark =>
  dark ? 'rgba(255,255,255,.9)' : 'rgba(0, 26, 39, 0.9)';

export default function Cursor({ primary }) {
  const {
    focused,
    latestFocused,
    primaryCursor,
    secondaryCursor,
    gridX,
    gridY,
    dark,
  } = useChartContext();

  const resolvedFocused = focused || latestFocused;
  const cursor = primary ? primaryCursor : secondaryCursor;

  const {
    showLine,
    showLabel,
    resolvedValue,
    snap,
    render,
    axis,
    siblingAxis,
    resolvedShow,
  } = cursor || {};

  const latestValue = useLatest(
    resolvedValue,
    typeof resolvedValue !== 'undefined'
  );

  const previousShowRef = React.useRef();
  React.useEffect(() => {
    previousShowRef.current = resolvedShow;
  }, [resolvedShow]);

  if (!cursor) {
    return null;
  }

  // Should we animate?
  const animated = snap || axis.type === 'ordinal';

  // Get the sibling range
  const siblingRange = siblingAxis.scale.range();

  let x;
  let y;
  let x1;
  let x2;
  let y1;
  let y2;
  let alignPctX;
  let alignPctY;

  // Vertical alignment
  if (axis.vertical) {
    y = axis.scale(latestValue);
    y1 = y - 1;
    y2 = y + axis.cursorSize + 1;
    if (axis.position === 'left') {
      x1 = siblingRange[0];
      x2 = siblingRange[1];
    } else {
      x1 = siblingRange[1];
      x2 = siblingRange[0];
    }
  } else {
    x = axis.scale(latestValue);
    x1 = x - 1;
    x2 = x + axis.cursorSize + 1;
    if (axis.position === 'top') {
      y1 = siblingRange[0];
      y2 = siblingRange[1];
    } else {
      y1 = siblingRange[1];
      y2 = siblingRange[0];
    }
  }

  const lineStartX = Math.min(x1, x2);
  const lineStartY = Math.min(y1, y2);
  const lineEndX = Math.max(x1, x2);
  const lineEndY = Math.max(y1, y2);
  const lineHeight = Math.max(lineEndY - lineStartY, 0);
  const lineWidth = Math.max(lineEndX - lineStartX, 0);

  let bubbleX;
  let bubbleY;

  // Bubble placement
  if (axis.vertical) {
    if (axis.position === 'left') {
      if (!axis.RTL) {
        bubbleX = lineStartX;
      } else {
        bubbleX = lineEndX;
      }
    } else {
      if (!axis.RTL) {
        bubbleX = lineEndX;
      } else {
        bubbleX = lineStartX;
      }
    }

    bubbleY = lineStartY + lineHeight / 2;
  } else {
    bubbleX = lineStartX + lineWidth / 2;

    if (axis.position === 'top') {
      bubbleY = lineStartY;
    } else {
      bubbleY = lineEndY;
    }
  }

  // Bubble anchoring
  if (axis.vertical) {
    alignPctY = -50;
    if (axis.position === 'left') {
      alignPctX = -100;
    } else {
      alignPctX = 0;
    }
  } else {
    alignPctX = -50;
    if (axis.position === 'top') {
      alignPctY = -100;
    } else {
      alignPctY = 0;
    }
  }

  const renderProps = { ...cursor };

  renderProps.formattedValue = String(
    axis.vertical
      ? typeof latestValue !== 'undefined'
        ? axis.format(
            axis.stacked && !primary && resolvedFocused
              ? resolvedFocused.totalValue
              : latestValue
          )
        : ''
      : typeof latestValue !== 'undefined'
      ? axis.format(
          axis.stacked && !primary && resolvedFocused
            ? resolvedFocused.totalValue
            : latestValue
        )
      : ''
  );

  // if (!axis.vertical) {
  // console.log({ bubbleX, bubbleY });
  // }

  let animateCoords;
  if (previousShowRef.current === resolvedShow) {
    animateCoords = true;
  }

  let renderedChildren = render(renderProps);

  return (
    <div
      style={{
        pointerEvents: 'none',
        position: 'absolute',
        top: 0,
        left: 0,
        transform: translate(gridX, gridY),
        opacity: resolvedShow ? 1 : 0,
        transition: 'all .3s ease',
      }}
      className="Cursor"
    >
      {/* Render the cursor line */}
      {showLine ? (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            transform: translate(lineStartX, lineStartY),
            width: `${lineWidth}px`,
            height: `${lineHeight}px`,
            background: getLineBackgroundColor(dark),
            transition:
              animated && animateCoords ? 'all .2s ease' : 'opacity .2s ease',
          }}
        />
      ) : null}
      {/* Render the cursor bubble */}
      {showLabel ? (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            transform: translate(bubbleX, bubbleY),
            transition:
              animated && animateCoords ? 'all .2s ease' : 'opacity .2s ease',
          }}
        >
          {/* Render the cursor label */}
          <div
            style={{
              padding: '5px',
              fontSize: '10px',
              background: getBackgroundColor(dark),
              color: getBackgroundColor(!dark),
              borderRadius: '3px',
              position: 'relative',
              transform: `translate3d(${alignPctX}%, ${alignPctY}%, 0)`,
              whiteSpace: 'nowrap',
            }}
          >
            {renderedChildren}
          </div>
        </div>
      ) : null}
    </div>
  );
}
