import { Component, OnInit } from '@angular/core';
import { ProduitService } from '../../services/produit.service';

@Component({
  selector: 'app-produit',
  templateUrl: './produit.component.html'
})
export class ProduitComponent implements OnInit {
  produits: any[] = [];
  totalPrixAchat: number = 0;
  totalPrixVente: number = 0;
  totalBenefice: number = 0;


  displayedColumns: string[] = [
    'nom', 'prixAchat', 'prixVente', 'quantite', 'stockRestant', 'prixTotalAchat', 'prixTotalVente', 'quantiteVendu', 'benefice', 'actions'
  ];
  produit: any = {
    nom: '',
    prixAchat: 0,
    prixVente: 0,
    quantite: 0,
    stockRestant: 0
  };

  constructor(private produitService: ProduitService) { }

  ngOnInit(): void {
    this.getProduits();
  }

  /** recalcul les champs aprés modification*/
  private recalculerChamps(): void {
    this.totalPrixAchat = 0;
    this.totalPrixVente = 0;
    this.totalBenefice = 0;

    this.produits.forEach(p => {
      p.prixAchat = p.prixAchat || 0;
      p.prixVente = p.prixVente || 0;
      p.quantite = p.quantite || 0;
      p.quantiteVendu = p.quantiteVendu || 0;

      p.stockRestant = p.quantite - p.quantiteVendu;
      p.prixTotalAchat = p.prixAchat * p.quantiteVendu;
      p.prixTotalVente = p.prixVente * p.quantiteVendu;
      p.benefice = p.prixTotalVente - p.prixTotalAchat;

      this.totalPrixAchat += p.prixTotalAchat;
      this.totalPrixVente += p.prixTotalVente;
      this.totalBenefice += p.benefice;
    });
  }

  getProduits(): void {
    this.produitService.getAll().subscribe(data => {
      this.produits = data;
      this.recalculerChamps();
    });
  }


  saveProduit(): void {
    if (this.produit.id) {
      this.produitService.update(this.produit).subscribe(() => {
        this.resetForm();
        this.getProduits();
      });
    } else {
      this.produitService.create(this.produit).subscribe(() => {
        this.resetForm();
        this.getProduits();
      });
    }
  }

  editProduit(p: any): void {
    this.produit = { ...p };
  }

  deleteProduit(id: number): void {
    this.produitService.delete(id).subscribe(() => this.getProduits());
  }

  resetForm(): void {
    this.produit = {
      nom: '',
      prixAchat: 0,
      prixVente: 0,
      quantite: 0,
      stockRestant: 0
    };
  }
  exporterPDF() {
    const url = 'http://localhost:8080/api/produits/export/pdf';
    window.open(url, '_blank');
  }


}