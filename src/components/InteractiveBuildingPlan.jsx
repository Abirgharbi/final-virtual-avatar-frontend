import React, { useRef, useEffect, useState } from "react";
import { Stage, Layer, Rect, Text, Line, Arrow, Circle, Group } from "react-konva";
import { Html } from "react-konva-utils";
import Konva from "konva";

const InteractiveBuildingPlan = ({ guidance, onRoomClick }) => {
  const stageRef = useRef(null);
  const arrowRef = useRef(null);
  const [highlightedRoom, setHighlightedRoom] = useState(null);
  const [pathPoints, setPathPoints] = useState([]);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, text: "" });
  const [showGuidanceText, setShowGuidanceText] = useState(true);

  // Données pour les étages
  const floors = [
    {
      y: 0,
      label: "Rez-de-chaussée",
      rooms: [
        { x: 50, y: 50, width: 80, height: 100, label: "Entrée Principale", id: "entrance", type: "entrance", floor: 0 },
        { x: 150, y: 50, width: 80, height: 100, label: "Bureau 101", id: "b101", type: "office", floor: 0 },
        { x: 250, y: 50, width: 80, height: 100, label: "Salle Réunion 1", id: "sr1", type: "meeting", floor: 0 },
        { x: 350, y: 50, width: 100, height: 100, label: "Ascenseur", id: "elevator1", type: "elevator", floor: 0 },
      ],
    },
    {
      y: 200,
      label: "Étage 1",
      rooms: [
        { x: 150, y: 250, width: 80, height: 100, label: "Bureau 201", id: "b201", type: "office", floor: 1 },
        { x: 250, y: 250, width: 80, height: 100, label: "Salle Réunion 2", id: "sr2", type: "meeting", floor: 1 },
        { x: 350, y: 250, width: 100, height: 100, label: "Ascenseur", id: "elevator2", type: "elevator", floor: 1 },
        { x: 470, y: 250, width: 90, height: 100, label: "Direction", id: "direction", type: "office", floor: 1 },
      ],
    },
    {
      y: 400,
      label: "Étage 2",
      rooms: [
        { x: 150, y: 450, width: 80, height: 100, label: "Bureau 301", id: "b301", type: "office", floor: 2 },
        { x: 250, y: 450, width: 80, height: 100, label: "Salle 2", id: "s2", type: "meeting", floor: 2 },
        { x: 350, y: 450, width: 100, height: 100, label: "Ascenseur", id: "elevator3", type: "elevator", floor: 2 },
      ],
    },
  ];

  // Fonction pour parser le guidance en JavaScript
  const parseGuidance = (guidance) => {
    if (!guidance) return { targetLabel: null, startFloor: null, targetFloor: null, direction: null };

    // Normaliser la guidance (minuscules, supprimer virgules et points)
    const guidanceLower = guidance.toLowerCase().replace(/[,.\s]+/g, ' ');

    // Détecter l'étage de départ
    let startFloor = null;
    const startFloorMatch = guidanceLower.match(/de (rez-de-chaussée|\d+(er|ème) étage)/);
    if (startFloorMatch) {
      startFloor = startFloorMatch[1].includes('rez-de-chaussée') ? 0 : parseInt(startFloorMatch[1]);
    }

    // Détecter l'étage de destination
    let targetFloor = null;
    const targetFloorMatch = guidanceLower.match(/(au|vers l'etage|pour arriver au) (\d+)(er|ème)? (etage)?/);
    if (targetFloorMatch) {
      targetFloor = parseInt(targetFloorMatch[2]);
    } else {
      const etageMatch = guidanceLower.match(/l'etage (\d+)/);
      if (etageMatch) {
        targetFloor = parseInt(etageMatch[1]);
      }
    }

    // Détecter la direction
    let direction = null;
    const directionMatch = guidanceLower.match(/puis à (droite|gauche)/);
    if (directionMatch) {
      direction = directionMatch[1];
    }

    // Détecter la salle cible (prendre la dernière salle mentionnée, ignorer "ascenseur" si possible)
    let targetLabel = null;
    const roomRegex = /(bureau \d+|salle réunion \d+|salle \d+|entrée principale|direction|ascenseur)/g;
    const roomMatches = guidanceLower.match(roomRegex) || [];
    if (roomMatches.length > 0) {
      for (let i = roomMatches.length - 1; i >= 0; i--) {
        if (roomMatches[i] !== 'ascenseur') {
          targetLabel = roomMatches[i].charAt(0).toUpperCase() + roomMatches[i].slice(1);
          break;
        }
      }
      if (!targetLabel) {
        targetLabel = roomMatches[roomMatches.length - 1].charAt(0).toUpperCase() + roomMatches[roomMatches.length - 1].slice(1);
      }
    }

    return { targetLabel, startFloor, targetFloor, direction };
  };

  useEffect(() => {
    console.log("Guidance reçu :", guidance);
    const { targetLabel, startFloor, targetFloor, direction } = parseGuidance(guidance);
    console.log("Résultat du parsing :", { targetLabel, startFloor, targetFloor, direction });

    let effectiveTargetFloor = targetFloor !== null ? targetFloor : (startFloor !== null ? startFloor : 0);

    let targetRoom = null;
    if (targetLabel) {
      targetRoom = floors.find(f => f.label.toLowerCase().includes(effectiveTargetFloor === 0 ? "rez-de-chaussée" : `${effectiveTargetFloor}`))?.rooms.find((r) => r.label.toLowerCase().includes(targetLabel.toLowerCase()));
    } else {
      // Si pas de salle, utiliser l'ascenseur de l'étage cible comme point d'arrivée temporaire
      targetRoom = floors.find(f => f.label.toLowerCase().includes(effectiveTargetFloor === 0 ? "rez-de-chaussée" : `${effectiveTargetFloor}`))?.rooms.find((r) => r.type === "elevator");
    }
    console.log("Salle cible trouvée :", targetRoom);

    if (targetRoom) {
      setHighlightedRoom(targetRoom.id);

      const entrance = floors[0].rooms.find((r) => r.id === "entrance");
      if (entrance) {
        let path = [
          entrance.x + entrance.width / 2, entrance.y + entrance.height / 2,
        ];

        let effectiveStartFloor = startFloor !== null ? startFloor : 0;
        const startElevator = floors.find(f => f.label.toLowerCase().includes(effectiveStartFloor === 0 ? "rez-de-chaussée" : `${effectiveStartFloor}`))?.rooms.find((r) => r.type === "elevator");
        if (startElevator) {
          path.push(startElevator.x + startElevator.width / 2, startElevator.y + startElevator.height / 2);
        }

        if (targetRoom.floor !== effectiveStartFloor) {
          const targetElevator = floors.find(f => f.label.toLowerCase().includes(targetRoom.floor === 0 ? "rez-de-chaussée" : `${targetRoom.floor}`))?.rooms.find((r) => r.type === "elevator");
          if (targetElevator) {
            path.push(targetElevator.x + targetElevator.width / 2, targetElevator.y + targetElevator.height / 2);

            if (direction === "droite") {
              path.push(targetElevator.x + targetElevator.width + 50, targetElevator.y + targetElevator.height / 2);
            } else if (direction === "gauche") {
              path.push(targetElevator.x - 50, targetElevator.y + targetElevator.height / 2);
            }
          }
        }

        path.push(targetRoom.x + targetRoom.width / 2, targetRoom.y + targetRoom.height / 2);

        console.log("Points du chemin :", path);
        setPathPoints(path);

        let dashOffset = 0;
        const anim = new Konva.Animation((frame) => {
          if (arrowRef.current) {
            dashOffset -= 0.5;
            arrowRef.current.dashOffset(dashOffset);
          }
        }, stageRef.current?.getLayers()[0]);
        anim.start();

        return () => anim.stop();
      }
    } else {
      console.log("Aucune salle cible trouvée pour :", { targetLabel, startFloor, targetFloor });
    }
  }, [guidance]);

  // Couleurs basées sur le type de salle
  const getRoomFill = (room) => {
    if (highlightedRoom === room.id) return "yellow";
    switch (room.type) {
      case "entrance": return "lightgreen";
      case "office": return "lightblue";
      case "meeting": return "lightpink";
      case "elevator": return "lightgray";
      default: return "white";
    }
  };

  // Gestion des tooltips
  const showTooltip = (e, text) => {
    const pointerPosition = e.target.getStage().getPointerPosition();
    setTooltip({ visible: true, x: pointerPosition.x + 10, y: pointerPosition.y + 10, text });
  };

  const hideTooltip = () => {
    setTooltip({ visible: false, x: 0, y: 0, text: "" });
  };

  return (
    <div className="relative">
      <div className="w-full bg-white p-2 border-b border-gray-200">
        <div className="flex justify-start items-center gap-4 px-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-[#90ee90]"></div><span>Entrée</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-[#add8e6]"></div><span>Bureau</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-[#ffb6c1]"></div><span>Salle Réunion</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-[#d3d3d3]"></div><span>Ascenseur</span>
          </div>
        </div>
      </div>

      <Stage width={1000} height={700} ref={stageRef} draggable scaleX={0.8} scaleY={0.8}>
        <Layer>
          <Rect x={0} y={0} width={1000} height={700} fillLinearGradientStartPoint={{ x: 0, y: 0 }} fillLinearGradientEndPoint={{ x: 800, y: 700 }} fillLinearGradientColorStops={[0, "#f0f8ff", 1, "#e6e6fa"]} />

          {floors.map((floor, fi) => (
            <Group key={fi}>
              <Line points={[0, floor.y, 1000, floor.y]} stroke="gray" strokeWidth={3} shadowBlur={5} shadowColor="rgba(0,0,0,0.2)" />
              <Text text={floor.label} x={20} y={floor.y + 10} fontSize={20} fontStyle="bold" fill="#333" shadowBlur={2} shadowColor="rgba(0,0,0,0.1)" />

              {floor.rooms.map((room, ri) => (
                <Group
                  key={ri}
                  onMouseEnter={(e) => {
                    e.target.getStage().container().style.cursor = "pointer";
                    showTooltip(e, `${room.label}\nCliquez pour plus d'infos`);
                  }}
                  onMouseLeave={(e) => {
                    e.target.getStage().container().style.cursor = "default";
                    hideTooltip();
                  }}
                  onClick={() => onRoomClick(room)}
                >
                  <Rect
                    x={room.x}
                    y={room.y}
                    width={room.width}
                    height={room.height}
                    fill={getRoomFill(room)}
                    stroke="black"
                    strokeWidth={2}
                    cornerRadius={5}
                    shadowBlur={10}
                    shadowColor={highlightedRoom === room.id ? "gold" : "rgba(0,0,0,0.1)"}
                  />
                  <Text text={room.label} x={room.x + 10} y={room.y + 40} fontSize={16} fill="#333" width={room.width - 20} wrap="word" align="center" />
                  {room.type === "entrance" && <Circle x={room.x + room.width / 2} y={room.y + 20} radius={12} fill="green" />}
                  {room.type === "office" && <Rect x={room.x + room.width / 2 - 5} y={room.y + 10} width={12} height={12} fill="blue" />}
                  {room.type === "meeting" && <Circle x={room.x + room.width / 2} y={room.y + 20} radius={6} fill="red" />}
                </Group>
              ))}
            </Group>
          ))}

          {pathPoints.length > 0 && (
            <Arrow
              ref={arrowRef}
              points={pathPoints}
              stroke="red"
              strokeWidth={4}
              fill="red"
              pointerLength={10}
              pointerWidth={10}
              dash={[10, 5]}
              shadowBlur={5}
              shadowColor="red"
            />
          )}

          {tooltip.visible && (
            <Html>
              <div
                style={{
                  position: "absolute",
                  left: tooltip.x,
                  top: tooltip.y,
                  background: "white",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                  fontSize: "16px",
                  whiteSpace: "pre-wrap",
                  pointerEvents: "none",
                }}
              >
                {tooltip.text}
              </div>
            </Html>
          )}

          {showGuidanceText && guidance && (
            <Html>
              <div
                style={{
                  position: "absolute",
                  top: 20,
                  left: 20,
                  background: "rgba(255,255,255,0.95)",
                  padding: "12px 18px",
                  borderRadius: "10px",
                  boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
                  fontSize: "18px",
                  maxWidth: "400px",
                  border: "1px solid #ccc",
                  wordWrap: "break-word",
                  whiteSpace: "pre-wrap",
                }}
              >
                <strong>📍 Instructions :</strong> {guidance}
                <br />
                <em>Suivez la ligne rouge pour votre itinéraire.</em>
              </div>
            </Html>
          )}
        </Layer>
      </Stage>

      <div className="absolute top-2 right-2">
        <button
          onClick={() => setShowGuidanceText(!showGuidanceText)}
          className="bg-blue-500 text-white px-3 py-1.5 rounded-md text-base font-medium hover:bg-blue-600 transition"
        >
          {showGuidanceText ? "Masquer Instructions" : "Afficher Instructions"}
        </button>
      </div>
    </div>
  );
};

export default InteractiveBuildingPlan;