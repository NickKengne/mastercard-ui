/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useCallback } from "react";
import { FileText, Copy, Check, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const FileHashGenerator = () => {
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [copying, setCopying] = useState(null);
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  const [textHash, setTextHash] = useState("");

  //Ajout d'une contante pour la taille maximale (10 MB)
  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  const summarizeText = (text, maxLength = 200) => {
    // Découpe le texte en phrases
    const sentences = text.split(/[.!?]+/);
    let summary = "";
    let currentLength = 0;

    for (let sentence of sentences) {
      sentence = sentence.trim();
      if (!sentence) continue;

      if (currentLength + sentence.length <= maxLength) {
        summary += sentence + ". ";
        currentLength += sentence.length;
      } else {
        break;
      }
    }

    return summary.trim();
  };

  const processFile = useCallback(async (file) => {
    try {
      // Vérification de la taille du fichier
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`Le fichier ${file.name} dépasse la limite de 10 MB`);
      }

      // Génération du résumé avec gestion des erreurs de lecture
      let summary = "";
      
      if (file.type.startsWith("text/")) {
        try {
          const text = await file.text();
          summary = summarizeText(text);
        } catch (err) {
          summary = "Erreur lors de la lecture du fichier texte";
        }
      } else if (file.type.includes("pdf")) {
        summary = "Le résumé des fichiers PDF n'est pas encore supporté";
      } else {
        summary = `Fichier binaire de type ${file.type}`;
      }

      // Calcul du hash SHA-256
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      return {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: new Date(file.lastModified).toLocaleString(),
        summary,
        hash: hashHex,
      };
    } catch (err) {
      throw new Error(`Erreur pour ${file.name}: ${err.message}`);
    }
  });

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      // Traitement des fichiers un par un pour une meilleure gestion des erreurs
      const newResults = [];
      for (const file of files) {
        try {
          const result = await processFile(file);
          newResults.push(result);
        } catch (err) {
          setError((prev) => (prev ? `${prev}\n${err.message}` : err.message));
        }
      }

      if (newResults.length > 0) {
        setResults((prev) => [...newResults, ...prev]);
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopying(index);
      setTimeout(() => setCopying(null), 2000);
    } catch (err) {
      setError("Erreur lors de la copie dans le presse-papiers");
    }
  };

  const generateTextHash = async () => {
    if (!inputText.trim()) return;

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(inputText);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      setTextHash(hashHex);
    } catch (err) {
      setError("Erreur lors de la génération du hash");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4 mt-[40px]">
        <h1 className="text-3xl font-bold">
          Générateur de résumés avec SHA-256
        </h1>
        <p className="text-gray-600">
          Sélectionnez des fichiers texte pour générer leurs résumés et
          empreintes SHA-256
        </p>
      </div>

      <div className="space-y-4 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold">
          Générer un hash depuis un texte
        </h2>
        <div className="space-y-2">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full p-3 border rounded-lg min-h-[100px]"
            placeholder="Entrez votre texte ici..."
          />
          <button
            onClick={generateTextHash}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={!inputText.trim()}
          >
            Générer le hash
          </button>
        </div>
        {textHash && (
          <div className="space-y-2">
            <h4 className="font-medium">Empreinte SHA-256 :</h4>
            <div className="font-mono text-sm p-3 bg-gray-50 rounded break-all flex justify-between items-center">
              <span>{textHash}</span>
              <button
                onClick={() => copyToClipboard(textHash, "text")}
                className="p-2 hover:bg-gray-100 rounded"
                title="Copier le hash"
              >
                {copying === "text" ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <Copy className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <label className="flex items-center justify-center w-full max-w-xl p-8 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
          <div className="text-center space-y-2">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <div className="text-sm text-gray-600">
              <label className="relative cursor-pointer rounded-md font-semibold text-blue-500 hover:underline">
                <span>Sélectionner des fichiers</span>
                <input
                  type="file"
                  className="sr-only"
                  multiple
                  accept=".txt,.pdf,.doc,.docx"
                  onChange={handleFileChange}
                  disabled={loading}
                />
              </label>
              <p className="mt-1 text-xs text-gray-500">
                Taille maximale: 10 MB par fichier
              </p>
            </div>
          </div>
        </label>
      </div>

      {loading && (
        <div className="text-center p-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-2 text-gray-600">
            Traitement des fichiers en cours...
          </p>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {results.map((result, index) => (
          <div
            key={index}
            className="p-4 border rounded-lg bg-white shadow-sm space-y-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{result.name}</h3>
                <p className="text-sm text-gray-500">
                  Taille: {(result.size / 1024).toFixed(2)} KB • Dernière
                  modification: {result.lastModified}
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(result.hash, index)}
                className="p-2 hover:bg-gray-100 rounded"
                title="Copier le hash"
              >
                {copying === index ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <Copy className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Résumé du contenu :</h4>
              <div className="p-3 bg-gray-50 rounded text-sm">
                {result.summary || "Pas de résumé disponible"}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Empreinte SHA-256 :</h4>
              <div className="font-mono text-sm p-3 bg-gray-50 rounded break-all">
                {result.hash}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileHashGenerator;