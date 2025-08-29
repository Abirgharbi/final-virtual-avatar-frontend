# Projet Avatar IA Interactif - Frontend

<img width="1902" height="917" alt="image" src="https://github.com/user-attachments/assets/b4092b7f-12e6-4d17-9fb0-1d2103890eb2" />

## 🏛️ Architecture

```mermaid
graph TD
    A[Frontend<br>React/TypeScript] -->|HTTP Requests| B[Backend<br>Node.js/Express]
    
    subgraph Frontend
        A -->|Composants| C[UI.jsx<br>Interface principale]
        A -->|Composants| D[InputWithVoice.jsx<br>Entrée vocale]
        A -->|Composants| E[InteractiveBuildFindPlan.jsx<br>Guidage interactif]
        A -->|Composants| F[UseChat.jsx<br>IA conversationnelle]
        A -->|Composants| G[Avatar.jsx<br>Avatar 3D]
        A -->|Composants| H[components/<br>Composants réutilisables]
    end
    
    B -->|REST API| I[recognize-face<br>Reconnaissance faciale]
    B -->|REST API| J[register-visitor<br>Enregistrement visiteur]
    B -->|REST API| K[chat<br>IA conversationnelle]
    B -->|REST API| L[appointments<br>Google Calendar]
    B -->|REST API| M[api-login<br>Authentification]
    B -->|REST API| N[check-out<br>Fin de visite]
    
    B -->|Données JSON| A
    B -->|Service externe| O[Reconnaissance Faciale<br>Python Flask]
    B -->|Service externe| P[Groq API<br>Llama3-70b]
    B -->|Service externe| Q[ElevenLabs API<br>Text-to-Speech]
    B -->|Service externe| R[Rhubarb<br>Lip Sync]
    B -->|Service externe| S[Google Calendar API]
    B -->|Service externe| T[Pinecone<br>Vector Search]
```
 
## 📖 Description

Ce dépôt contient le code source du **frontend** pour le projet **Avatar IA Interactif pour Accueil Intelligent**, conçu pour automatiser et humaniser l'accueil physique en entreprise via un avatar IA. Le système intègre des fonctionnalités telles que la reconnaissance faciale, l'enregistrement des visiteurs,prise de rendez vous et un guidage intelligent dans les locaux.

Le frontend, centré autour du composant principal `UI.jsx`, offre une interface utilisateur intuitive. Il interagit avec un backend pour gérer la logique métier.

## 🎯 Objectifs du Projet

- **Automatisation** : Identifier les employés et visiteurs via reconnaissance faciale.
- **Personnalisation** : Présentation multilingue adaptée au visiteur.
- **Guidage** : Plans interactifs pour guider les visiteurs dans les locaux.
- **Fonctionnalités Premium** : Contrôle d'accès, IA conversationnelle, prise de rendez-vous.

## 🚀 Fonctionnalités Principales

### Reconnaissance et Enregistrement
- **Reconnaissance faciale** : Identification en temps réel des employés et des visiteurs.
- **Enregistrement intelligent** : Capture photo, saisie assistée, génération de badges avec QR code.

### Guidage
- **Guidage interactif** : Mini-plan interactif avec instructions vocales, envoyé sur mobile ou via QR code.

### Fonctionnalités Supplémentaires
- Interactions vocales via IA conversationnelle.
- Prise de rendez-vous synchronisée avec Google Calender.
- Moteur d'apprentissage pour facilter l'accès des visiteurs.

## 🗂️ Structure du Projet

- **src/** : Code source principal.
  - `UI.jsx` : Composant central orchestrant l'interface utilisateur.
  - `InputWithVoice.jsx` : Entrée de messages avec support audio.
  - `InteractiveBuildFindPlan.jsx` : Génération de plans interactifs pour le guidage.
  - `AdaptiveAnalysis.jsx` : Non utilisé, prévu pour des recommandations IA.
  - `UseChat.jsx` : Gestion des réponses conversationnelles de l'avatar.
  - `Avatar.jsx` : Affichage de l'avatar 3D avec animations (modèle GLB).
  - `components/` : Composants réutilisables.
- **public/** : Fichiers publics, incluant le modèle GLB de l'avatar et des animations de l'avatar.

## 🛠️ Technologies Utilisées

- **Framework** : React.js
- **Bibliothèques** :
  - Rendu 3D : Three.js (modèle GLB)
- **Styles** : Tailwind CSS

## 📦 Installation

1. Clonez le dépôt :
```bash
git clone https://github.com/Abirgharbi/final-virtual-avatar-frontend.git
```
2. Installez les dépendances :
```bash
cd final-virtual-avatar-frontend
npm install
```
## 🚀 Usage 
Lancez l'application en mode développement :
```bash
yarn dev 
```
## 📋 Guide 
- Vérifiez l'intégration de `UI.jsx` (accueil, enregistrement, guidage).
- Testez l'entrée vocale `InputWithVoice` et les réponses de l'avatar (UseChat).
- Validez le rendu 3D et les animations dans `Avatar.jsx` (modèle GLB).
- Testez les plans interactifs dans `InteractiveBuildFindPlan`.
- Vérifiez les appels API vers le backend.

