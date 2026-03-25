import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  section: {
    margin: 10,
    padding: 10,
  },
  paragraph: {
    fontSize: 12,
    lineHeight: 1.5,
    marginBottom: 10,
  },
  bold: {
    fontWeight: 'bold',
  },
  signatures: {
    marginTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: {
    width: 200,
    borderTop: 1,
    paddingTop: 10,
    textAlign: 'center',
  }
});

interface ContractProps {
  entrepriseName: string;
  stagiaireName: string;
  stageTitle: string;
  duration: string;
  startDate: string;
  location: string;
  compensation?: string;
}

export const StageContractDocument = ({ 
  entrepriseName, 
  stagiaireName, 
  stageTitle, 
  duration, 
  startDate, 
  location, 
  compensation 
}: ContractProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>CONTRAT DE STAGE</Text>
      
      <View style={styles.section}>
        <Text style={styles.paragraph}>
          Entre les soussignés :
        </Text>
        <Text style={styles.paragraph}>
          L'entreprise <Text style={styles.bold}>{entrepriseName}</Text>, d'une part,
        </Text>
        <Text style={styles.paragraph}>
          Et l'étudiant(e) <Text style={styles.bold}>{stagiaireName}</Text>, d'autre part.
        </Text>
        
        <Text style={{ ...styles.paragraph, marginTop: 20 }}>
          Il a été convenu ce qui suit :
        </Text>
        
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Article 1 - Objet du stage</Text>{"\n"}
          Le Stagiaire s'engage à effectuer un stage au sein de l'Entreprise en qualité de "{stageTitle}".
        </Text>
        
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Article 2 - Durée et lieu</Text>{"\n"}
          Le stage se déroulera sur une durée de {duration}, à compter du {startDate}. Le lieu d'exécution du stage est fixé à {location}.
        </Text>

        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Article 3 - Gratification</Text>{"\n"}
          Le Stagiaire percevra une gratification de {compensation ? `${compensation}` : 'la gratification minimale légale en vigueur'}, selon la réglementation.
        </Text>
        
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Article 4 - Engagements mutuels</Text>{"\n"}
          L'Entreprise s'engage à fournir les moyens nécessaires à l'accomplissement des missions. Le Stagiaire s'engage à respecter le règlement intérieur de l'Entreprise ainsi que les règles de confidentialité.
        </Text>
      </View>

      <View style={styles.signatures}>
        <View style={styles.signatureBox}>
          <Text style={{ fontSize: 12 }}>Pour l'Entreprise</Text>
          <Text style={{ fontSize: 10, color: 'gray', marginTop: 5 }}>(Signature et cachet)</Text>
        </View>
        <View style={styles.signatureBox}>
          <Text style={{ fontSize: 12 }}>Le Stagiaire</Text>
          <Text style={{ fontSize: 10, color: 'gray', marginTop: 5 }}>(Signature précédée de "Lu et approuvé")</Text>
        </View>
      </View>
    </Page>
  </Document>
);
