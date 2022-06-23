import React from 'react';
import styled from 'styled-components';

import { EventEmitter } from '/src/libs/events';

import ReactCore from '/src/plugins/interface/react-core';

const Wrap = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

const WindowWrap = styled.div`
  position: fixed;
  top: 10px;
  left: 10px;
  width: 150px;
  height: 200px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 0 5px 0 rgba(0, 0, 0, .2);
  pointer-events: all;
  font-size: 14px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const WindowTitle = styled.div`
  width: 100%;
  padding: 6px 12px;
  background: #f5f5f5;
  box-sizing: border-box;
  cursor: move;
  font-weight: bold;
`;

const WindowResize = styled.div`
  width: 100%;
  height: 10px;
  padding: 6px 12px;
  background: #fff5f5;
  box-sizing: border-box;
  cursor: move;
  font-weight: bold;
  justify-self: flex-end;
`;

const WindowContent = styled.div`
  width: 100%;
  height: 100%;
`;

type PropsOf<T,> = T extends React.FC<infer A> ? A : never;
type Point = { x: number; y: number };

type DraggableWindowProps = {
  width?: number;
  height?: number;
  children: React.ReactNode;
  title: string;
};

const DraggableWindow = ({ width, height, children, title, ...props }: DraggableWindowProps & Partial<PropsOf<typeof WindowWrap>>) => {
  const redo = (x: string, y: string) => (node: HTMLElement, e: MouseEvent, point: Point) => {
    const rect = node.getBoundingClientRect();
    const xval = parseInt(node.getAttribute(`data-${x}`) || rect[x]);
    const yval = parseInt(node.getAttribute(`data-${y}`) || rect[y]);

    const newxval = xval + e.pageX - point.x;
    const newyval = yval + e.pageY - point.y;

    node.setAttribute(`data-${x}`, newxval.toString());
    node.setAttribute(`data-${y}`, newyval.toString());

    node.style[x] = Math.round(newxval / 10) * 10 + 'px';
    node.style[y] = Math.round(newyval / 10) * 10 + 'px';
  };

  const startDrag = (f) => (e) => {
    e.preventDefault();
    e.stopPropagation();

    const node = e.target.parentNode;

    let point = { x: e.pageX, y: e.pageY };

    node.style.pointerEvents = 'none';

    const handleMouseMove = (e) => {
      e.preventDefault();
      e.stopPropagation();

      f(node, e, point);
      point = { x: e.pageX, y: e.pageY };
    };

    const handleMouseUp = (e) => {
      e.preventDefault();
      e.stopPropagation();
      node.style.pointerEvents = 'all';

      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <WindowWrap {...props} style={{ ...props.style, width, height }}>
      <WindowTitle onMouseDown={startDrag(redo('left', 'top'))}>{title}</WindowTitle>
      <WindowContent>{children}</WindowContent>
      <WindowResize onMouseDown={startDrag(redo('width', 'height'))}/>
    </WindowWrap>
  );
};

export default class WindowsManager {
  public onWindows = new EventEmitter();

  constructor (private core: ReactCore) {
    this.core.onContent.on(() => {
      return (
        <Wrap>
          {this.onWindows.emitps(null).map((window) => {
            return (
              <DraggableWindow title={window.title} width={window.width} height={window.height}>
                {window.content}
              </DraggableWindow>
            );
          })}
        </Wrap>
      )
    });
  }
};
